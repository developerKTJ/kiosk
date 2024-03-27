import videoSrc from "../media/video3.mp4";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import img1 from "../media/maejang3.png";
import img2 from "../media/pack3.png";
import img11 from "../media/001.png"
import img22 from "../media/002.png";
import img33 from "../media/003.png";
import closebtn from "../media/closebtn2.png";
import { useCookies } from "react-cookie";
import axios from "axios";
// import axios from "axios";
function Home() {
  const [cookies, setCookie] = useCookies(["basket", "packageType"]);
  const [products, setProducts] = useCookies(["products"]);
  const [currentImage, setCurrentImage] = useState(0);
  const images = [img11, img22, img33]; // 이미지 배열

    // 클래스를 제거하는 함수를 컴포넌트의 최상위에 정의
  const removeActiveClass = () => {
    const homeBtnBox = document.querySelector('.home_btn_box');
    if (homeBtnBox && homeBtnBox.classList.contains('active')) {
      homeBtnBox.classList.remove('active');
    }
  };

  const addActiveClass = () => {
    const homeBtnBox = document.querySelector('.home_btn_box');
    homeBtnBox.classList.add('active');
  };

  // 매장/포장 선택 핸들러 수정
  const handlePackageType = (type) => {
    setCookie("packageType", type, { path: "/" });
    // navigate("/selecttea"); 직접 이동 대신, Link 컴포넌트를 사용합니다.
  };

  // 이미지 슬라이드
  useEffect(() => {
  // 이미지 슬라이드 쇼를 위한 타이머 설정
  const interval = setInterval(() => {
    setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
  }, 3000); // 5초마다 이미지 변경

  return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 타이머 정리
}, [images.length]);

  useEffect(() => {
    setCookie("basket", [], { path: "/" });
    setCookie("cardnumber", "", { path: "/" });
  }, []);

  useEffect(() => {
    const background = document.querySelector('.home_background');
    if (background) {
        background.addEventListener('click', addActiveClass);
    }
    return () => {
        if (background) {
            background.removeEventListener('click', addActiveClass);
        }
    };
}, []);

  useEffect(() => {
    axios.get("/products.json").then((data) => {
      setProducts(data.data.categories);
    });
  }, []);

  useEffect(() => {
    document.title = "홈 | 코키티 키오스크";
  }, []);

  useEffect(() => {
    // 이미지 슬라이드 쇼를 위한 타이머 설정
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3초마다 이미지 변경

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 타이머 정리
  }, [images.length]);

  //활동 없을 시 창 닫기
  useEffect(() => {
    // 사용자 활동 감지 및 active 클래스 제거 로직
    let idleTimer = null;
    const removeActiveClass = () => {
      const homeBtnBox = document.querySelector('.home_btn_box');
      if (homeBtnBox.classList.contains('active')) {
        homeBtnBox.classList.remove('active');
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(removeActiveClass, 10000); // 30초 후 실행
    };

    // 초기 타이머 설정 및 이벤트 리스너 추가
    resetIdleTimer();
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('keydown', resetIdleTimer);
    };
  }, []);
  
  return (
    <div className="home_background">
      <div className="part">
        <video autoPlay loop muted className="home_video">
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="part touch">
        <img src="./img/touch_please.jpg" alt="" />
      </div>  
      <div className="part touch">
        <img src={images[currentImage]} alt="homepic" className="homepic" />
      </div> 

      {/* <img src={videoSrc} alt="homepic" className="homepic" /> */}
      <br />
      <div className="home_btn_box" >
        <div className="home_btn_card">
          <div className="home_btn_title">
            포장 방법을 선택하세요.
          </div>
          <img className="home_close_btn" src={closebtn} onClick={removeActiveClass}></img>
          {/*매장포장 변경점*/}
        <Link className="img_shadow left" to="/selecttea" onClick={() => handlePackageType('매장')}>
          <img src={img1} alt="먹고가기" className="home_btn" />
          <p>매장</p>
        </Link>
        <Link className="img_shadow right" to="/selecttea" onClick={() => handlePackageType('포장')}>
          <img  src={img2} alt="포장하기" className="home_btn pojang" />
          <p className="pojang">포장</p>
        </Link>
        </div>
      </div>
    </div>
  );
}
export default Home;
