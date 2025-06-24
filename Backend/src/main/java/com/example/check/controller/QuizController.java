package com.example.check.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.check.model.Question;
import com.example.check.model.Quiz;
import com.example.check.model.Score;
import com.example.check.response_pojo.UserScore;
import com.example.check.service.QuizNotificationService;
import com.example.check.service.QuizService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private QuizNotificationService quizNotificationService;

    @GetMapping("/getAllQuizzes")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/getAvailableQuizzes")
    public ResponseEntity<List<Quiz>> getAvailableQuizzes() {
        return ResponseEntity.ok(quizService.getAvailableQuizzes());
    }

    @GetMapping("/getAllQuizzesForDisplay")
    public ResponseEntity<List<Quiz>> getAllQuizzesForDisplay() {
        return ResponseEntity.ok(quizService.getAllQuizzesForDisplay());
    }

    @PostMapping("/createQuiz")
    public ResponseEntity<String> createQuiz(@RequestBody Map<String, Object> requestData, Principal principal) {
        try {
            String heading = (String) requestData.get("heading");
            List<Map<String, Object>> questionData = (List<Map<String, Object>>) requestData.get("questions");
            Integer timeLimit = ((Number) requestData.get("timeLimit")).intValue();
            
            // Handle scheduling data
            Boolean isScheduled = (Boolean) requestData.get("isScheduled");
            String scheduledStartDateTimeStr = (String) requestData.get("scheduledStartDateTime");
            String scheduledEndDateTimeStr = (String) requestData.get("scheduledEndDateTime");

            if (heading == null || heading.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Quiz title cannot be blank.");
            }

            if (timeLimit == null || timeLimit <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Time limit must be greater than 0.");
            }

            String username = principal.getName();
            Quiz quiz = new Quiz();
            quiz.setHeading(heading);
            quiz.setTimeLimit(timeLimit);
            
            // Set scheduling data
            if (isScheduled != null && isScheduled) {
                quiz.setIs_scheduled(true);
                if (scheduledStartDateTimeStr != null && !scheduledStartDateTimeStr.isEmpty()) {
                    quiz.setScheduledStartDateTime(java.time.LocalDateTime.parse(scheduledStartDateTimeStr));
                }
                if (scheduledEndDateTimeStr != null && !scheduledEndDateTimeStr.isEmpty()) {
                    quiz.setScheduledEndDateTime(java.time.LocalDateTime.parse(scheduledEndDateTimeStr));
                }
            } else {
                quiz.setIs_scheduled(false);
            }

            // Convert question data to Question objects
            List<Question> questions = new ArrayList<>();
            if (questionData != null) {
                for (Map<String, Object> qData : questionData) {
                    Question question = new Question();
                    question.setQuestion((String) qData.get("question"));
                    question.setQuestionType((String) qData.get("questionType"));

                    // Handle different question types
                    switch (question.getQuestionType()) {
                        case "MCQ":
                            question.setOption1((String) qData.get("option1"));
                            question.setOption2((String) qData.get("option2"));
                            question.setOption3((String) qData.get("option3"));
                            question.setOption4((String) qData.get("option4"));
                            question.setAnswer((String) qData.get("answer"));
                            break;

                        case "TRUE_FALSE":
                            question.setTrueFalseAnswer((Boolean) qData.get("trueFalseAnswer"));
                            question.setAnswer(question.getTrueFalseAnswer().toString());
                            break;

                        case "FILL_BLANK":
                            question.setFillBlankAnswer((String) qData.get("fillBlankAnswer"));
                            question.setAnswer(question.getFillBlankAnswer());
                            break;

                        case "MATCHING":
                            @SuppressWarnings("unchecked") List<String> leftOptions = (List<String>) qData.get("leftOptions");
                            @SuppressWarnings("unchecked") List<String> rightOptions = (List<String>) qData.get("rightOptions");
                            @SuppressWarnings("unchecked") List<String> correctMatches = (List<String>) qData.get("correctMatches");

                            question.setLeftOptions(leftOptions);
                            question.setRightOptions(rightOptions);
                            question.setCorrectMatches(correctMatches);
                            question.setAnswer(String.join(",", correctMatches));
                            break;

                        case "CODING":
                            question.setCodingQuestion((String) qData.get("codingQuestion"));
                            question.setTestCases((String) qData.get("testCases"));
                            question.setExpectedOutput((String) qData.get("expectedOutput"));
                            question.setProgrammingLanguage((String) qData.get("programmingLanguage"));
                            question.setStarterCode((String) qData.get("starterCode"));
                            question.setAnswer(question.getExpectedOutput());
                            break;

                        default:
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Invalid question type: " + question.getQuestionType());
                    }

                    question.setQuiz(quiz);
                    questions.add(question);
                }
            }

            quiz.setQuestions(questions);
            Quiz savedQuiz = quizService.createQuiz(quiz, username);
            
            // Create notifications if quiz is scheduled
            if (isScheduled != null && isScheduled && quiz.getScheduledStartDateTime() != null && quiz.getScheduledEndDateTime() != null) {
                try {
                    quizNotificationService.createQuizNotifications(
                        savedQuiz.getId(),
                        savedQuiz.getHeading(),
                        savedQuiz.getScheduledStartDateTime(),
                        savedQuiz.getScheduledEndDateTime()
                    );
                } catch (Exception e) {
                    // Log the error but don't fail the quiz creation
                    System.err.println("Error creating quiz notifications: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok("Quiz created successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating quiz: " + e.getMessage());
        }
    }

    @PostMapping("/AddAQuestion/{quizId}")
    public ResponseEntity<String> AddAQuestion(@PathVariable("quizId") Long quizId, @RequestBody Question question) {
        String response = quizService.AddAQuestion(quizId, question);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/GetAllQuestions/{quizId}")
    public ResponseEntity<List<Question>> GetAllQuestions(@PathVariable("quizId") Long quizId) {
        Optional<Quiz> quizOptional = quizService.GetAllQuestions(quizId);
        if (quizOptional.isPresent()) {
            return ResponseEntity.ok(quizOptional.get().getQuestions());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of());
        }
    }

    @DeleteMapping("/deleteQuiz/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable("quizId") Long quizId) {
        return ResponseEntity.ok(quizService.deleteQuiz(quizId));
    }

    @DeleteMapping("/removeQuestion/{quizId}/{questionId}")
    public ResponseEntity<String> removeQuestion(@PathVariable("quizId") Long quizId, @PathVariable("questionId") Long questionId) {
        boolean isDeleted = quizService.removeQuestion(quizId, questionId);
        if (isDeleted) {
            return ResponseEntity.ok("Question deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Question not found.");
        }
    }

    @PutMapping("/updateQuestion/{questionId}")
    public ResponseEntity<String> updateQuestion(@PathVariable("questionId") Long questionId,
            @RequestBody Map<String, Object> questionData) {
        try {
            Question updatedQuestion = new Question();
            updatedQuestion.setQuestion((String) questionData.get("question"));
            updatedQuestion.setQuestionType((String) questionData.get("questionType"));

            // Handle different question types
            switch (updatedQuestion.getQuestionType()) {
                case "MCQ":
                    updatedQuestion.setOption1((String) questionData.get("option1"));
                    updatedQuestion.setOption2((String) questionData.get("option2"));
                    updatedQuestion.setOption3((String) questionData.get("option3"));
                    updatedQuestion.setOption4((String) questionData.get("option4"));
                    updatedQuestion.setAnswer((String) questionData.get("answer"));
                    break;

                case "TRUE_FALSE":
                    updatedQuestion.setTrueFalseAnswer((Boolean) questionData.get("trueFalseAnswer"));
                    updatedQuestion.setAnswer(updatedQuestion.getTrueFalseAnswer().toString());
                    break;

                case "FILL_BLANK":
                    updatedQuestion.setFillBlankAnswer((String) questionData.get("fillBlankAnswer"));
                    updatedQuestion.setAnswer(updatedQuestion.getFillBlankAnswer());
                    break;

                case "MATCHING":
                    @SuppressWarnings("unchecked") List<String> leftOptions = (List<String>) questionData.get("leftOptions");
                    @SuppressWarnings("unchecked") List<String> rightOptions = (List<String>) questionData.get("rightOptions");
                    @SuppressWarnings("unchecked") List<String> correctMatches = (List<String>) questionData.get("correctMatches");

                    updatedQuestion.setLeftOptions(leftOptions);
                    updatedQuestion.setRightOptions(rightOptions);
                    updatedQuestion.setCorrectMatches(correctMatches);
                    updatedQuestion.setAnswer(String.join(",", correctMatches));
                    break;

                case "CODING":
                    updatedQuestion.setCodingQuestion((String) questionData.get("codingQuestion"));
                    updatedQuestion.setTestCases((String) questionData.get("testCases"));
                    updatedQuestion.setExpectedOutput((String) questionData.get("expectedOutput"));
                    updatedQuestion.setProgrammingLanguage((String) questionData.get("programmingLanguage"));
                    updatedQuestion.setStarterCode((String) questionData.get("starterCode"));
                    updatedQuestion.setAnswer(updatedQuestion.getExpectedOutput());
                    break;

                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid question type: " + updatedQuestion.getQuestionType());
            }

            boolean isUpdated = quizService.updateQuestion(questionId, updatedQuestion);

            if (isUpdated) {
                return ResponseEntity.ok("✅ Question updated successfully!");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Question not found!");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating question: " + e.getMessage());
        }
    }

    @PostMapping("/addScore")
    public ResponseEntity<String> addScore(@Valid @RequestBody ScoreRequest scoreRequest, Principal principal) {
        try {
            // Validate the score
            if (scoreRequest.getScore() < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Score cannot be negative.");
            }

            // Log the received score for debugging
            System.out.println("Received score: " + scoreRequest.getScore()
                    + " for quiz: " + scoreRequest.getQuizname()
                    + " (quizId: " + scoreRequest.getQuizId() + ")");

            // Ensure the username matches the authenticated user
            String authenticatedUsername = principal.getName();
            if (!authenticatedUsername.equals(scoreRequest.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only submit scores for your own user account.");
            }

            Score score = new Score();
            score.setUsername(scoreRequest.getUsername());
            score.setQuizId(scoreRequest.getQuizId());
            score.setQuizname(scoreRequest.getQuizname());
            score.setScore(scoreRequest.getScore());

            String result = quizService.addScore(score);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving score: " + e.getMessage());
        }
    }

    @GetMapping("/getAllScores")
    public ResponseEntity<List<Score>> getAllScores(Principal principal) {
        try {
            String username = principal.getName();
            List<Score> scores = quizService.getScoresByUsername(username);
            System.out.println("Retrieved scores for user " + username + ": " + scores);
            return ResponseEntity.ok(scores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    @GetMapping("/ScoreForAQuiz/{quiz_name}")
    public List<UserScore> ScoreForAQuiz(@PathVariable("quiz_name") String quiz_name) {
        List<Score> gg = quizService.ScoreForAQuiz(quiz_name);
        HashMap<String, Long> charCountMap = new HashMap<>();
        gg.forEach(it -> {
            charCountMap.put(it.getUsername(), Math.max(it.getScore(), charCountMap.getOrDefault(it.getUsername(), 0L)));
        });
        List<UserScore> mew = new ArrayList<>();
        for (Map.Entry<String, Long> entry : charCountMap.entrySet()) {
            UserScore tt = new UserScore();
            tt.setUsername(entry.getKey());
            tt.setNumber(entry.getValue());
            mew.add(tt);
        }

        Collections.sort(mew, new Comparator<UserScore>() {
            public int compare(UserScore o1, UserScore o2) {
                return Long.compare(o1.getNumber(), o2.getNumber());
            }
        });

        Collections.reverse(mew);
        return mew;
    }

    @DeleteMapping("/deleteScoresByQuizName/{quiz_name}")
    public String deleteScoresByQuizName(@PathVariable("quiz_name") String quiz_name) {
        return quizService.deleteScoresByQuizName(quiz_name);
    }

    public static class QuizRequest {

        @NotBlank(message = "Quiz title cannot be blank")
        private String heading;

        public String getHeading() {
            return heading;
        }

        public void setHeading(String heading) {
            this.heading = heading;
        }
    }

    public static class ScoreRequest {

        @NotBlank(message = "Username cannot be blank")
        private String username;
        private Long quizId; // Added quizId
        private String quizname; // Added quizname
        private long score;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public Long getQuizId() {
            return quizId;
        }

        public void setQuizId(Long quizId) {
            this.quizId = quizId;
        }

        public String getQuizname() {
            return quizname;
        }

        public void setQuizname(String quizname) {
            this.quizname = quizname;
        }

        public long getScore() {
            return score;
        }

        public void setScore(long score) {
            this.score = score;
        }
    }
}
