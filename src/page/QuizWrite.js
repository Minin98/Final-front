import React, { useState } from "react";
import apiAxios from "../lib/apiAxios";
import "../css/QuizWrite.css";

export default function QuizWrite({ chapterNumber, onClose, onQuizSubmit }) {
    const [quizzes, setQuizzes] = useState([{ question: "", answer: "", description: "" }]);

    // 입력 값 변경 핸들러
    const handleChange = (index, field, value) => {
        const newQuizzes = [...quizzes];
        newQuizzes[index][field] = value;
        setQuizzes(newQuizzes);
    };

    // 새 퀴즈 추가
    const handleAddQuiz = () => {
        setQuizzes([...quizzes, { question: "", answer: "", description: "" }]);
    };

    // 퀴즈 삭제
    const handleDeleteQuiz = (index) => {
        setQuizzes(quizzes.filter((_, i) => i !== index));
    };

    // "등록" 버튼 클릭 시 실행
    const handleSubmit = async () => {
        for (let quiz of quizzes) {
            if (!quiz.question.trim() || !quiz.answer.trim() || !quiz.description.trim()) {
                alert("모든 필드를 입력해주세요.");
                return;
            }
        }

        const data = {
            chapterNumber: chapterNumber,
            quizzes: quizzes.map((quiz, index) => ({
                quizNumber: index + 1,
                question: quiz.question,
                answer: quiz.answer,
                description: quiz.description
            }))
        };

        apiAxios.post("/quiz/insert", data)
            .then((res) => {
                alert(res.data.msg);
                onClose();
                onQuizSubmit();  // 퀴즈 등록 후 클래스 정보 갱신
            }).catch((error) => console.log(error));
    };

    return (
        <div className="quiz-write-modal">
            <div className="quiz-write-container">
                <h2>OX 퀴즈 등록</h2>
                <div className="quiz-scroll-container">
                    {quizzes.map((quiz, index) => (
                        <div key={index} className="quiz-item">
                            <hr />
                            <span className="quiz-number">{index + 1}번 문제 <button className="delete-quiz-btn" onClick={() => handleDeleteQuiz(index)}>x</button></span>
                            <textarea
                                className="quiz-question"
                                placeholder="퀴즈 질문을 입력하세요"
                                value={quiz.question}
                                onChange={(e) => handleChange(index, "question", e.target.value)}
                                rows="3"
                            />
                            <textarea
                                className="quiz-description"
                                placeholder="퀴즈 설명을 입력하세요"
                                value={quiz.description}
                                onChange={(e) => handleChange(index, "description", e.target.value)}
                                rows="3"
                            />
                            <input
                                type="text"
                                placeholder="정답을 입력하세요"
                                value={quiz.answer}
                                onChange={(e) => handleChange(index, "answer", e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <button onClick={handleAddQuiz} className="add-quiz-btn">퀴즈 추가</button>
                <div className="quiz-write-buttons">
                    <button onClick={handleSubmit} className="submit-btn">등록</button>
                    <button onClick={onClose} className="cancel-btn">취소</button>
                </div>
            </div>
        </div>
    );
}