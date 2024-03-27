import "./purchase.css";
import img1 from "../media/card.png";
import arrow from "../media/arrow.png";
import videoSrc from "../media/video3.mp4";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

function purchase() {
  const inputRef = useRef();
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(0);
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [cookies, setCookie] = useCookies(["basket"]);
  const [cardnumber, Setcardnumber] = useCookies(["cardnumber"]);

  const [basket, setBasket] = useState([]);

  // 쿠키에서 장바구니 데이터를 불러오고, JSON 파싱하여 상태에 저장
  useEffect(() => {
    // cookies.basket가 이미 객체라면 JSON.parse 사용하지 않음
    console.log("Loaded basket from cookies:", cookies.basket);
    const basketFromCookie = cookies.basket || [];
    setBasket(basketFromCookie);
  }, [cookies.basket]);



  // basket 상태가 변경될 때마다 총 결제 금액을 다시 계산
  useEffect(() => {
    const newTotalPrice = basket.reduce((acc, item) => {
      const price = Number(item.pdPrice) || 0;
      const quantity = Number(item.quantity) || 0; // 수정된 부분: count -> quantity
      return acc + price * quantity;
    }, 0);
    setTotalPrice(newTotalPrice);
  }, [basket]);

  useEffect(() => {
    let temp = 0;
    data.forEach((item) => {
      temp += item.pdPrice * item.count;
    });
    setTotalPrice(temp);
  }, [data]);

  useEffect(() => {
    document.title = "결제하기 | 코키티 키오스크";
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);


  function onChange(e) {
    const inputVal = e.target.value;
    // 입력된 값에서 카드 번호 부분만 추출하는 로직
    if (inputVal.length >= 30) {
      const cardData = inputVal.split('^')[0]; // '^'를 기준으로 데이터를 분리

      // 알파벳으로 시작하는 경우는 앞부분을 제외하고 추출, 그렇지 않은 경우는 첫 글자만 제외
      let cardNumber = '';
      if (/^[a-zA-Z]/.test(cardData)) {
        cardNumber = cardData.substring(1).trim(); // 알파벳으로 시작하는 경우에는 첫 글자를 제외하고 추출
      } else {
        cardNumber = cardData.trim(); // 그렇지 않은 경우에는 공백을 제거한 후 사용
      }

      console.log("Extracted card number: ", cardNumber); // 추출된 카드 번호 확인

      setTimeout(() => {
        try {
          navigate("/done?data=" + cardNumber);
        } catch (error) {
          console.log(error);
        }
      }, 3000);
    }
  }

  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  async function payFunction() {
    const dataToSend = basket.map(item => ({
        pdId: item.pdId,
        pdName: item.pdName,
        extraPrice: item.extraPrice,
        price: item.pdPrice,
        quantity: item.quantity
    }));

    try {
        const response = await axios.post(
            "http://192.168.10.153:8080/kokee/kiosk",
            dataToSend
        );
        console.log(response.data);
        // Navigate on success
        navigate("/done");
    } catch (error) {
        alert("There was an error processing your request.");
        console.error(error);
    }
}

//활동 없을 시 홈으로
useEffect(() => {
  // 사용자 활동 감지 및 active 클래스 제거 로직
  let idleTimer = null;

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      navigate('/')
    },60000); // 60초 후 실행
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
}, [navigate]);


  return (
    <div className="buy_screen">
      <div className="ad">
        <video autoPlay loop muted className="video">
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="card_wrap shadow">
        <div className="card_title"> 
          신용카드 결제(Credit Card Check)
        </div>
        <div className="text_wrap2">
          <p>
          결제하실 신용카드를
          <br />
          화살표 방향으로
          <br />
          긁어주세요
          <br />
          <br />
          Please swipe
          <br />
          your credit card 
          <br />
          in the direction 
          <br />
          of the arrow 
          <br />
          to make a payment.
          </p>
        </div>
        <div className="card_icon_wrap">
          <div className="card_num">
          <label>
            카드번호 : &nbsp;
          </label>
          <input
            ref={inputRef}
            type="password"
            className="card_input"
            size={34}
            onBlur={handleBlur}
            onChange={onChange}
          />
          </div>
          <div className="card_icon_img">
            <img
            src={img1}
            className="buy_img"
            onClick={() =>
            navigate("/done?data=" + inputRef.current.value.toString())
            }
            ></img>
            <img className="arrow" src={arrow}></img>
          </div>

        </div>
      
        <div className="bottom_buttons2">
          <Link to="/" className="bottom_buy2 buy_back">
            <p>
              이전<br />(Home)
            </p>
          </Link>
            <p onClick={payFunction} className="bottom_buy2 buy_add">
              결제하기<br />(Pay)
            </p>

        </div>

      </div>
    </div>
  );
}
export default purchase;
