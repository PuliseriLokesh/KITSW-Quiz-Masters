package com.example.check.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a Question entity associated with a Quiz.
 */
@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @Column(nullable = false)
    private String questionType; // MCQ, TRUE_FALSE, FILL_BLANK, MATCHING, CODING

    // For MCQ
    private String option1;
    private String option2;
    private String option3;
    private String option4;

    // For TRUE_FALSE
    private Boolean trueFalseAnswer;

    // For FILL_BLANK
    private String fillBlankAnswer;

    // For MATCHING
    @ElementCollection
    private List<String> leftOptions = new ArrayList<>();
    
    @ElementCollection
    private List<String> rightOptions = new ArrayList<>();
    
    @ElementCollection
    private List<String> correctMatches = new ArrayList<>();

    // For CODING
    private String codingQuestion;
    private String testCases;
    private String expectedOutput;
    private String programmingLanguage;
    private String starterCode;

    @Column(nullable = false)
    private String answer; // For MCQ, this stores the correct option

    @JsonIgnore // Prevents infinite recursion
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    // Default constructor (required by JPA)
    public Question() {
    }

    // Constructor with all fields
    public Question(String question, String questionType, String option1, String option2, String option3, String option4,
            Boolean trueFalseAnswer, String fillBlankAnswer, List<String> leftOptions, List<String> rightOptions,
            List<String> correctMatches, String codingQuestion, String testCases, String expectedOutput,
            String programmingLanguage, String starterCode, String answer, Quiz quiz) {
        this.question = question;
        this.questionType = questionType;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.trueFalseAnswer = trueFalseAnswer;
        this.fillBlankAnswer = fillBlankAnswer;
        this.leftOptions = leftOptions;
        this.rightOptions = rightOptions;
        this.correctMatches = correctMatches;
        this.codingQuestion = codingQuestion;
        this.testCases = testCases;
        this.expectedOutput = expectedOutput;
        this.programmingLanguage = programmingLanguage;
        this.starterCode = starterCode;
        this.answer = answer;
        this.quiz = quiz;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getOption1() {
        return option1;
    }

    public void setOption1(String option1) {
        this.option1 = option1;
    }

    public String getOption2() {
        return option2;
    }

    public void setOption2(String option2) {
        this.option2 = option2;
    }

    public String getOption3() {
        return option3;
    }

    public void setOption3(String option3) {
        this.option3 = option3;
    }

    public String getOption4() {
        return option4;
    }

    public void setOption4(String option4) {
        this.option4 = option4;
    }

    public Boolean getTrueFalseAnswer() {
        return trueFalseAnswer;
    }

    public void setTrueFalseAnswer(Boolean trueFalseAnswer) {
        this.trueFalseAnswer = trueFalseAnswer;
    }

    public String getFillBlankAnswer() {
        return fillBlankAnswer;
    }

    public void setFillBlankAnswer(String fillBlankAnswer) {
        this.fillBlankAnswer = fillBlankAnswer;
    }

    public List<String> getLeftOptions() {
        return leftOptions;
    }

    public void setLeftOptions(List<String> leftOptions) {
        this.leftOptions = leftOptions;
    }

    public List<String> getRightOptions() {
        return rightOptions;
    }

    public void setRightOptions(List<String> rightOptions) {
        this.rightOptions = rightOptions;
    }

    public List<String> getCorrectMatches() {
        return correctMatches;
    }

    public void setCorrectMatches(List<String> correctMatches) {
        this.correctMatches = correctMatches;
    }

    public String getCodingQuestion() {
        return codingQuestion;
    }

    public void setCodingQuestion(String codingQuestion) {
        this.codingQuestion = codingQuestion;
    }

    public String getTestCases() {
        return testCases;
    }

    public void setTestCases(String testCases) {
        this.testCases = testCases;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public String getProgrammingLanguage() {
        return programmingLanguage;
    }

    public void setProgrammingLanguage(String programmingLanguage) {
        this.programmingLanguage = programmingLanguage;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    // toString method
    @Override
    public String toString() {
        return "Question [id=" + id + ", question=" + question + ", questionType=" + questionType + "]";
    }
}
