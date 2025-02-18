import { React, useEffect, useState, useRef, useCallback } from "react";
import "../css/MypageInfo.css";
import { useSelector } from "react-redux";
import axios from "axios";
import defaultImg from "../img/defaultImg.png";
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export default function MypageInfo() {
  const [profileImage, setProfileImage] = useState(""); // 현재 프로필 이미지
  const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일
  const [isUploadEnabled, setIsUploadEnabled] = useState(false); // 업로드 버튼 활성화 여부
  const token = useSelector((state) => state.users.value.token);
  const [userInfo, setUserInfo] = useState({});
  const [dataRoad, setDataRoad] = useState(true);
  const [type, setType] = useState(null);
  const [originInfo, setOriginInfo] = useState({});
  const inputRefs = useRef({});
  const fieldOrder = [
    { key: "name", label: "이름" },
    { key: "nickname", label: "닉네임" },
    { key: "email", label: "이메일" },
    { key: "phone", label: "전화번호" }
  ];
  const [updateToggle, setUpdateToggle] = useState(
    {
      name: false,
      nickname: false,
      email: false,
      phone: false
    }
  );
  
  const fetchUserInfo = useCallback(() => {
    if (!token) {
      console.error("토큰이 없습니다.");
      return;
    }

    const decodedToken = jwtDecode(token);
    setType(decodedToken.type);

    axios
      .post("http://localhost:9999/MypageInfo", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUserInfo(res.data);
        setOriginInfo(res.data);
      })
      .catch((err) => console.error("요청 에러:", err));
  }, [token]);

  const fetchProfileImage = useCallback(() => {
    if (!token) return;

    axios
      .post("http://localhost:9999/ProfileImage", {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log("서버 응답:", res.data);
        if (res.data.profileImageUrl && res.data.profileImageUrl !== "non") {
          setProfileImage(`http://localhost:9999${res.data.profileImageUrl}`);
        } else {
          setProfileImage(defaultImg);
        }
      })
      .catch((err) => console.error("요청 에러:", err));
  }, [token]);

  useEffect(() => {
    fetchUserInfo();
    fetchProfileImage();
  }, [token, fetchUserInfo, fetchProfileImage]);


  // 파일 선택 시 미리보기 표시
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadEnabled(true); // 업로드 버튼 활성화

      // 파일 미리보기 설정
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 업로드 요청
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("업로드할 파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://localhost:9999/UpdateUserProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("업로드 성공:", res.data);

      if (res.data.profilePath) {
        setProfileImage(`http://localhost:9999${res.data.profilePath}`);
      }

      setIsUploadEnabled(false);
      alert("프로필 사진이 변경되었습니다.");
      setDataRoad(!dataRoad);
    } catch (error) {
      console.error("파일 업로드 에러:", error);
      alert("파일 업로드에 실패했습니다.");
    }
  };

  const handleFileRemove = async () => {
    axios.post(
      "http://localhost:9999/UpdateUserProfile",
      { file: null },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    axios
      .post(
        "http://localhost:9999/ProfileImage",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("서버 응답:", res.data);
        setProfileImage(res.data.profileImageBase64);
      })
      .catch((err) => console.error("요청 에러:", err));

    alert("프로필 사진이 삭제되었습니다.");
  };

  const updatehandle = async () => {
    const updatedData = {};

    // 변경된 값만 저장
    Object.keys(updateToggle).forEach((key) => {
      if (updateToggle[key]) {
        updatedData[key] = inputRefs.current[key]?.value;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    console.log("전송할 데이터:", updatedData);

    try {
      const res = await axios.patch("http://localhost:9999/Updateuserinfo", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);
      if (res.data) {
        alert("정보 변경 완료");
      }

      // 업데이트 완료 후 최신 데이터 불러오기
      setDataRoad((prev) => !prev);
    } catch (error) {
      console.error("업데이트 실패:", error);
    }
  };



  const toggleEditMode = (e) => {
    const buttonId = e.target.className.split("-")[0];
    // console.log("버튼 ID:", buttonId);

    if (e.target.className.includes("update")) {
      setUserInfo(prev => ({
        ...prev,
        [buttonId]: originInfo[buttonId]
      }));
    }

    setUpdateToggle(prevState => ({
      ...prevState,
      [buttonId]: !prevState[buttonId]
    }));
  };

  const changeValue = (e) => {
    const id = e.target.id;
    // console.log(id);

    setUserInfo(prev => ({
      ...prev,
      [id]: inputRefs.current[id] ? inputRefs.current[id].value : "",
    }));
  };

  return (
    <div className="mypage-container">
      <div className="profile-section">
        <label htmlFor="fileInput">
          <img
            src={profileImage || defaultImg}
            alt="프로필 이미지"
            className="profile-image"
            style={{ cursor: "pointer" }}
          />
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <h1>
          {userInfo.name} <br></br>{userInfo.grade === 1 ? "강사" : "수강생"}님
        </h1>
        {/* 프로필 사진 변경 버튼 */}
        <div className="profile-buttons">
          <button
            className="profile-button"
            onClick={handleUpload}
            disabled={!isUploadEnabled}>
            {isUploadEnabled ? "프로필 사진 변경" : "이미지 클릭시 파일 선택"}
          </button>
          <button className="removeprofile-button" onClick={handleFileRemove}>
            프로필 삭제하기
          </button>
        </div>
      </div>
      <div className="divider"></div>

      <div className="info-section">
        <h1>마이페이지</h1>
        {fieldOrder.map(({ key, label }) => (
          userInfo[key] !== undefined && (
            <div className={`info-${key}`} key={key}>
              {!updateToggle[key] ? (
                <div className="info-block">
                  <span>{label}</span>
                  <p>{userInfo[key]}</p>
                  <button className={`${key}-edit`} onClick={(e) => toggleEditMode(e, key)}>수정</button>
                </div>
              ) : (
                <div className="info-block">
                  <span>{label}</span>
                  <input
                    id={key}
                    ref={(el) => (inputRefs.current[key] = el)}
                    onChange={changeValue}
                    value={userInfo[key]}
                  />
                  <div className="btn-block">
                    <button className={`${key}-update`} onClick={(e) => toggleEditMode(e, key)} style={{ margin: "0px 10px 0px 0px" }}>취소</button>
                    <button className={`${key}-update`} onClick={updatehandle}>저장</button>
                  </div>
                </div>
              )}
            </div>
          )
        ))}
        <div className="edit-warning">
          <Link to="/checkUser" state="/deleteUser">회원 탈퇴</Link>
          {type === 0 && (
            <Link className="password-change" to="/checkUser" state="/updatePassword">비밀번호 변경하기</Link>
          )}
        </div>
      </div>
    </div>
  );
}