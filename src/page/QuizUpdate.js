import React, { useState, useEffect } from "react";
import apiAxios from "../lib/apiAxios";
import "../css/QuizWrite.css";

export default function QuizEdit({ chapterNumber, onClose, onQuizUpdated }) {
    const [quizzes, setQuizzes] = useState([]);
    console.log(chapterNumber);
    // 초기 퀴즈 정보 불러오기
    useEffect(() => {
        apiAxios.get(`/quiz/list/${chapterNumber}`)
            .then((res) => {
                setQuizzes(res.data.quizList);  // 여러 퀴즈 정보를 가져옴
            })
            .catch((err) => console.error(err));
    }, [chapterNumber]);

    // 입력 값 변경 핸들러
    const handleChange = (index, field, value) => {
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[index][field] = value;
        setQuizzes(updatedQuizzes);
    };

    // 퀴즈 수정 제출
    const handleSubmit = async () => {
        // 유효성 검사: 모든 필드를 입력했는지 확인
        for (let quiz of quizzes) {
            if (!quiz.question.trim() || !quiz.answer.trim() || !quiz.description.trim()) {
                alert("빈칸을 입력해주세요.");
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
        console.log(data);
        apiAxios.post("/quiz/update", data)
            .then((res) => {
                alert(res.data.msg);
                onQuizUpdated();
                onClose();  // 수정 후 모달 닫기
            })
            .catch((error) => {
                console.error(error);
                alert("퀴즈 수정에 실패했습니다.");
            });
    };
    // 퀴즈 삭제
    const handleDeleteQuiz = (index) => {
        setQuizzes(quizzes.filter((_, i) => i !== index));
    };
    // 새 퀴즈 추가
    const handleAddQuiz = () => {
        setQuizzes([...quizzes, { question: "", answer: "", description: "" }]);
    };
    return (
        <div className="quiz-write-modal">
            <div className="quiz-write-container">
                <h2>퀴즈 수정</h2>
                <div className="quiz-scroll-container">
                    {quizzes.map((quiz, index) => (
                        <div key={quiz.quizNumber} className="quiz-item">
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
                    <button onClick={handleSubmit} className="submit-btn">수정</button>
                    <button onClick={onClose} className="cancel-btn">취소</button>
                </div>
            </div>
        </div>
    );
}
