import videoSrc from "../media/video1.mp4";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import img1 from "../media/maejang4.png";
import img2 from "../media/pack3.png";
import img11 from "../media/001.png"
import img22 from "../media/002.png";
import img33 from "../media/003.png";
import { useCookies } from "react-cookie";
import axios from "axios";
// import axios from "axios";
function Home() {
  const [cookies, setCookie] = useCookies(["basket"]);
  const [products, setProducts] = useCookies(["products"]);
  const [currentImage, setCurrentImage] = useState(0);
  const images = [img11, img22, img33]; // 이미지 배열

  const addActiveClass = () => {
    const homeBtnBox = document.querySelector('.home_btn_box');
    homeBtnBox.classList.add('active');
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
      <div className="home_btn_box">
        <div className="home_btn_card">
          <div className="home_btn_title">
            포장 방법을 선택하세요.
          </div>
        <Link to="/selecttea">
          <img src={img1} alt="먹고가기" className="home_btn" />
          <p>매장</p>
        </Link>
        <Link to="/selecttea">
          <img src={img2} alt="포장하기" className="home_btn pojang" />
          <p className="pojang">포장</p>
        </Link>
        </div>
      </div>
    </div>
  );
}
export default Home;
