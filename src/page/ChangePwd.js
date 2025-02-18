import { useRef } from "react";
import apiAxios from "../lib/apiAxios";
import { useNavigate } from "react-router-dom";
import '../css/ChangePwd.css';

export default function ChangePwd({ uno }) {
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const navigator = useNavigate();

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,15}$/;

    const handleChangePassword = () => {
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        if (!passwordRegex.test(password)) {
            alert("비밀번호는 영문, 숫자, 특수문자를 포함한 6~15자로 설정해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        const data = { uno: uno, pwd: password };

        apiAxios.post("/findPassword", data)
            .then(res => {
                alert(res.data.msg);
                passwordRef.current.value = "";
                confirmPasswordRef.current.value = "";
                navigator("/login");
            })
            .catch(err => {
                console.error("비밀번호 변경 오류:", err);
                alert("비밀번호 변경 실패");
            });
    };

    return (
        <div className="emailCheck">
            <div className="changePwd">
                <h2>새 비밀번호 변경</h2>
                <ul>
                    <li>안전한 비밀번호로 내 정보를 보호하세요.</li>
                    <li>다른 아이디/사이트에서 사용한 적 없는 비밀번호</li>
                    <li>이전에 사용한 적 없는 비밀번호가 안전합니다.</li>
                </ul>
                <div className="input_container">
                <label>비밀번호 (영문, 숫자, 특수문자 포함 6~15자) <span className="required">*</span></label>
                <input className="pwd" type="password" placeholder="새 비밀번호" ref={passwordRef} />
                <label>비밀번호 확인 <span className="required">*</span></label>
                <input className="pwd" type="password" placeholder="비밀번호 확인" ref={confirmPasswordRef} />
                <div className="btn_container">
                </div>
                <button onClick={handleChangePassword}>비밀번호 변경</button>
                <button onClick={() => navigator("/login")}>취소</button>
                </div>  
            </div>
        </div>
    );
}