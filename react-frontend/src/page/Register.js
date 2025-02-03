import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";
import apiAxios from "../lib/apiAxios";

export default function Register() {
  const id = useRef(null);
  const password = useRef(null);
  const checkPwd = useRef(null);
  const username = useRef(null);
  const nickname = useRef(null);
  const email = useRef(null);
  const phone = useRef(null);
  const [role, setRole] = useState("student");
  const [idValid, setIdValid] = useState(true); // 아이디 유효성 상태
  const [passwordValid, setPasswordValid] = useState(true); // 비밀번호 유효성 상태
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true); // 비밀번호 확인 유효성 상태
  const [idDuplicate, setIdDuplicate] = useState(false); // 아이디 중복 여부
  const [nicknameDuplicate, setNicknameDuplicate] = useState(false); // 닉네임 중복 여부
  const navigate = useNavigate();

  // 아이디 정규식 (영문, 숫자만 허용, 길이 6~15)
  const idRegex = /^[a-zA-Z0-9]{6,15}$/;
  // 비밀번호 정규식 (영문, 숫자, 특수문자 허용, 길이 6~15)
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/-]{6,15}$/;

  // 아이디 유효성 검사
  const checkId = () => {
    if (!idRegex.test(id.current.value)) {
      setIdValid(false); // 유효하지 않으면 상태 업데이트
      return false;
    }
    setIdValid(true); // 유효하면 상태 업데이트
    return true;
  };

  // 비밀번호 유효성 검사
  const checkPassword = () => {
    if (!passwordRegex.test(password.current.value)) {
      setPasswordValid(false); // 유효하지 않으면 상태 업데이트
      return false;
    }
    setPasswordValid(true); // 유효하면 상태 업데이트
    return true;
  };

  // 비밀번호 확인 검사
  const checkConfirmPassword = () => {
    if (password.current.value !== checkPwd.current.value) {
      setConfirmPasswordValid(false); 
      return false;
    }
    setConfirmPasswordValid(true);
    return true;
  };

  // 아이디 중복 체크 (POST 방식)
  const checkIdDuplicate = async () => {
    try {
      const response = await apiAxios.post("/check/id", {
        id: id.current.value,
      });
      if (!response.data.exists) {
        alert("아이디가 이미 존재합니다.");
        setIdDuplicate(true);
      } else {
        alert("사용 가능한 아이디입니다.");
        setIdDuplicate(false);
      }
    } catch (error) {
      console.error(error);
      alert("아이디 중복 확인 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 중복 체크 (POST 방식)
  const checkNicknameDuplicate = async () => {
    try {
      const response = await apiAxios.post("/check/nickname", {
        nickname: nickname.current.value,
      });
      if (!response.data.exists) {
        alert("닉네임이 이미 존재합니다.");
        setNicknameDuplicate(true);
      } else {
        alert("사용 가능한 닉네임입니다.");
        setNicknameDuplicate(false);
      }
    } catch (error) {
      console.error(error);
      alert("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const validateForm = () => {
    const isValidId = checkId();
    const isValidPassword = checkPassword();
    const isValidConfirmPassword = checkConfirmPassword();

    return isValidId && isValidPassword && isValidConfirmPassword && !idDuplicate && !nicknameDuplicate;
  };

  const register = () => {
    if (!validateForm()) {
      alert("입력한 정보를 확인해주세요.");
      return; // 유효성 검사 실패 시 폼 제출을 중단
    }
    apiAxios
      .post("/register", {
        id: id.current.value,
        password: password.current.value,
        username: username.current.value,
        nickname: nickname.current.value,
        email: email.current.value,
        phone: phone.current.value,
        role: role,
      })
      .then((res) => {
        console.log(res.data);
        if (res.data.count !== 0) {
          // 회원 등록 완료 후 로그인 페이지로 이동
          alert(res.data.msg);
          navigate("/login");
        }
      })
      .catch((err) => console.log(err));
  };

  const cancel = () => {
    navigate(-1);
  };

  return (
    <div className="register">
      <div className="register_container">
        <h2>수강생 또는 강사로 회원가입 후 서비스를 이용하세요.</h2>
        <div className="role-switch">
          <button
            className={`role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            수강생
          </button>
          <button
            className={`role-btn ${role === "teacher" ? "active" : ""}`}
            onClick={() => setRole("teacher")}
          >
            강사
          </button>
        </div>
        <form id="signupForm">
          <div className="left_container">
            <div className="form-group">
              <label>아이디 (숫자, 영문으로 이루어진 6~15자) *  <button type="button" className="check-duplicate-btn" onClick={checkIdDuplicate}>
                아이디 중복 확인
              </button></label>
              <input
                type="text"
                ref={id}
                required
                onBlur={checkId} // 아이디 체크
              />
              {!idValid && <p className="error-message">아이디는 영문과 숫자로 이루어진 6~15자여야 합니다.</p>}
              {idDuplicate && <p className="error-message">아이디가 이미 존재합니다.</p>}
            </div>
            <div className="form-group">
              <label>비밀번호 (숫자, 영문으로 이루어진 6~15자) *</label>
              <input
                type="password"
                ref={password}
                required
                onBlur={checkPassword} // 비밀번호 체크
              />
              {!passwordValid && <p className="error-message">비밀번호는 영문, 숫자, 특수문자 포함 6~15자여야 합니다.</p>}
            </div>
            <div className="form-group">
              <label>비밀번호 확인 *</label>
              <input
                type="password"
                ref={checkPwd}
                required
                onBlur={checkConfirmPassword} // 비밀번호 확인 체크
              />
              {!confirmPasswordValid && <p className="error-message">비밀번호가 일치하지 않습니다.</p>}
            </div>
          </div>
          <div className="right_container">
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" ref={username} required />
            </div>
            <div className="form-group">
              <label>닉네임 * <button type="button" className="check-duplicate-btn" onClick={checkNicknameDuplicate}>
                닉네임 중복 확인
              </button></label>
              <input type="text" ref={nickname} />

              {nicknameDuplicate && <p className="error-message">닉네임이 이미 존재합니다.</p>}
            </div>
            <div className="form-group">
              <label>이메일 *</label>
              <input
                type="email"
                ref={email}
                placeholder="이메일을 입력해주세요."
                required
              />
            </div>
            <div className="form-group">
              <label>전화번호 *</label>
              <input
                type="text"
                ref={phone}
                placeholder="'-'를 제외하고 숫자만 입력해주세요."
              />
            </div>
          </div>
          <p className="required-note">* 표시는 필수 입력입니다.</p>
          <div className="btn-container">
            <button type="button" className="submit-btn" onClick={register}>
              회원가입
            </button>
            <button type="button" className="cancel-btn" onClick={cancel}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
