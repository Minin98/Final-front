import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiAxios from "../lib/apiAxios";
import '../css/TeacherProfile.css';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function TeacherProfile() {
  const { uno } = useParams();
  const [teacherData, setTeacherData] = useState(null);
  const [teacherContent, setTeacherContent] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherAvailableTime, setTeacherAvailableTime] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  console.log(uno);
  const user = useSelector((state) => state.users.value);
  const decodeToken = user?.token ? jwtDecode(user.token) : null;
  const userUno = decodeToken?.sub; // sub에서 uno 가져오기
  const editor = useRef(null);
  const isOwner = userUno === uno; // 현재 로그인한 사용자와 프로필 사용자의 uno 비교
  useEffect(() => {
    if (!user?.token) return;
    apiAxios.get(`/teacherProfile/${uno}`)
      .then(res => {
        if (res.data.dto) {
          setTeacherData(res.data.dto);
          setTeacherContent(res.data.dto.teacherContent || "소개를 작성해주세요.");
          setTeacherEmail(res.data.dto.teacherEmail || "");
          setTeacherPhone(res.data.dto.teacherPhone || "");
          setTeacherAvailableTime(res.data.dto.teacherAvailableTime || "");
          setProfileImage(res.data.profileImg || "");
        }else{
          alert(res.data.msg);
          navigate(-1);
        }

      })
      .catch(err => {
        console.error('강사 정보를 불러오는 데 실패했습니다.', err);
      });
  }, [uno, user?.token]);

  const handleSave = () => {
    if (editor.current) {
      const content = editor.current.getInstance().getHTML();
      setTeacherContent(content);
      const data = {
        uno: uno,
        teacherContent: content,
        teacherEmail,
        teacherPhone,
        teacherAvailableTime
      }
      apiAxios.post(`/updateTeacherProfile`, data)
        .then((res) => {
          console.log('저장 완료');
          alert(res.data.msg);
        })
        .catch(err => {
          console.error('저장 실패:', err);
        });
    }
  };
  useEffect(() => {
    if (editor.current) {
      editor.current.getInstance().setMarkdown(teacherContent);
    }
  }, [teacherContent]);

  if (!user?.token) {
    return <p>로그인이 필요합니다.</p>;
  }

  return (
    <div className="teacher-background">
      <div className="teacher-profile-container">
      <div className="teacher-info-left">
        <div className="profile-pic">
          {profileImage && (
            <img src={profileImage} alt="Profile" className="profile-image" />
          )}
        </div>
        <h2 className="teacher-name">{teacherData?.name}</h2>
        <div className="teacher-email">
          <img src="/img/email.png" className="email-icon" />
          {isOwner ? (
            <input
              className="teacher-input"
              type="text"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
            />
          ) : (
            <p>{teacherData?.teacherEmail}</p>
          )}
        </div>

        <div className="phone">
          <img src="/img/phone.png" className="phone-icon" />
          {isOwner ? (
            <input
              className="teacher-input"
              type="text"
              value={teacherPhone}
              onChange={(e) => setTeacherPhone(e.target.value)}
            />
          ) : (
            <p>{teacherData?.teacherPhone}</p>
          )}
        </div>

        <div className="available-time">
          <img src="/img/time.png" className="time-icon" />
          {isOwner ? (
            <input
              className="teacher-input"
              type="text"
              value={teacherAvailableTime}
              onChange={(e) => setTeacherAvailableTime(e.target.value)}
            />
          ) : (
            <p>{teacherData?.teacherAvailableTime}</p>
          )}
        </div>
      </div>

      <div className="teacher-info-right">
        <h2>강사 소개</h2>
        {isOwner ? (
          <>
            <Editor
              ref={editor}
              initialValue={teacherContent}
              previewStyle="vertical"
              height="400px"
              initialEditType="wysiwyg"
              useCommandShortcut={true}
              onChange={() => setTeacherContent(editor.current?.getInstance().getHTML())}
            />
          <button type='button' className='teacher-save-button' onClick={handleSave}>저장</button>
          </>
        ) : (
          <div className="teacher-content" dangerouslySetInnerHTML={{ __html: teacherData?.teacherContent }} />
        )}
      </div>
      </div>
    </div>
  );
}
