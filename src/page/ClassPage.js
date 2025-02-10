import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import ClassUpdate from "./ClassUpdate";
import Chapter from "./Chapter";
import Notice from "./Notice";
import "../css/ClassPage.css";
import { jwtDecode } from "jwt-decode";

export default function ClassPage() {
    const { classNumber } = useParams();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("chapter");
    const [classInfo, setClassInfo] = useState({});
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const user = useSelector((state) => state.users.value);
    const decodeToken = user?.token ? jwtDecode(user.token) : null;
    const grade = decodeToken?.grade || (decodeToken?.roles === "강사" ? 1 : decodeToken?.roles === "학생" ? 2 : 3);
    const isClassOwner = classInfo?.uno && decodeToken?.sub && grade === 1 && String(decodeToken.sub) === String(classInfo?.uno);

    const fetchClassInfo = useCallback(() => {
        setLoading(true);
        apiAxios.get(`/class/${classNumber}`)
            .then((res) => {
                if (res.data.class) {
                    setClassInfo(res.data.class);
                } else {
                    console.error("강의 정보가 존재하지 않습니다.");
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [classNumber]);

    // 수강 여부 확인
    const checkEnrollmentStatus = useCallback(() => {
        apiAxios.get(`/users-progress/check?classNumber=${classNumber}`, {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then((res) => {
            setIsEnrolled(res.data.isEnrolled);
        })
        .catch((err) => console.error("수강 여부 확인 실패", err));
    }, [classNumber, user.token]);

    useEffect(() => {
        if (!classNumber) {
            console.error("classNumber가 존재하지 않습니다.");
            navigate("/");
            return;
        }
        fetchClassInfo();
        checkEnrollmentStatus(); // 수강 여부 확인
    }, [fetchClassInfo, checkEnrollmentStatus, classNumber, navigate]);

    const handleMenuChange = (menu) => {
        setActiveMenu(menu);
    };

    // "강의 수강하기" 버튼
    const enrollClass = () => {
        apiAxios.post(`/users-progress/application?classNumber=${classNumber}`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        })
        .then(() => {
            alert("강의 수강이 완료되었습니다!");
            setIsEnrolled(true);
        })
        .catch((err) => console.error("수강 신청 실패", err));
    };

    // "수강 취소" 버튼
    const handleCancelEnrollment = () => {
        apiAxios.delete(`/users-progress/cancel?classNumber=${classNumber}`, {
            headers: { "Authorization": `Bearer ${user.token}` }
        })
        .then(() => {
            alert("수강 취소가 완료되었습니다!");
            setIsEnrolled(false);
        })
        .catch((err) => console.error("수강 취소 실패", err));
    };

    return (
        <div className="class-container">
            {loading && <p className="loading-text">로딩 중...</p>}
            
            {/* 강의 헤더 */}
            <div className="class-header">
                <span className="class-category">{classInfo.category}</span>
                <h1 className="class-title">{classInfo.title}</h1>
                <p className="class-instructor">{classInfo.name} 강사</p>
                <p className="class-description">{classInfo.description}</p>
                <div className="class-rate">
                    <span>평점 : {classInfo.rate}</span>
                    <Link to={`/class/${classNumber}/rate`} className="review">수강평 보기</Link>
                </div>
                {isClassOwner && (
                    <div className="instructor-controls">
                        <button className="class-modify-button" onClick={() => setShowUpdateModal(true)}>강의 수정</button>
                        <button className="class-delete-button" onClick={() => console.log("강의 삭제")}>강의 삭제</button>
                    </div>
                )}
                {grade === 2 && (
                    isEnrolled ? (
                        <button className="class-cancel-button" onClick={handleCancelEnrollment}>
                            수강 취소
                        </button>
                    ) : (
                        <button className="class-enroll-button" onClick={enrollClass}>
                            강의 수강하기
                        </button>
                    )
                )}
            </div>

            {/* 강의 메뉴 */}
            <div className="class-menu">
                <button
                    className={activeMenu === "chapter" ? "active" : ""}
                    onClick={() => handleMenuChange("chapter")}
                >
                    챕터 목록
                </button>
                <button
                    className={activeMenu === "notice" ? "active" : ""}
                    onClick={() => handleMenuChange("notice")}
                >
                    공지사항
                </button>
                <button
                    className={activeMenu === "qna" ? "active" : ""}
                    onClick={() => handleMenuChange("qna")}
                >
                    Q&A
                </button>
                <button
                    className={activeMenu === "rate" ? "active" : ""}
                    onClick={() => handleMenuChange("rate")}
                >
                    수강평
                </button>
            </div>

            {/* Chapter에 isEnrolled 상태 전달 (즉시 반영) */}
            <div className="class-content">
                {activeMenu === "chapter" && <Chapter classNumber={classNumber} isEnrolled={isEnrolled} />}
                {activeMenu === "notice" && <Notice classNumber={classNumber} />}
                {activeMenu === "qna" && <Notice classNumber={classNumber} />}
                {activeMenu === "rate" && <Notice classNumber={classNumber} />}
            </div>

            {showUpdateModal && <ClassUpdate classInfo={classInfo} onClose={() => setShowUpdateModal(false)} />}
        </div>
    );
}
