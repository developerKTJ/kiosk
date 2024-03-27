import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import videoSrc from "../media/video3.mp4";
import { useNavigate, Link } from 'react-router-dom'; // Link 컴포넌트 추가
import { useCookies } from 'react-cookie';
import './SelectTea.css';
import closebtn from '../media/closebtn.png';
import plus from '../media/plus.png';
import minus from '../media/minus.png';
import coffee1 from '../media/사이즈1-1.png';
import barcode1 from '../media/barcode1.png';
import barcode2 from '../media/barcode2.png';
import extra1 from '../media/사이즈2-1.png';
import hotOption1 from "../media/hot1-1.png";
import hotOption2 from "../media/hot1-2.png";
import iceOption1 from "../media/ice1-1.png";
import iceOption2 from "../media/ice1-2.png";

Modal.setAppElement('#root');

//2기 소스는 스크립트로 db를 넣어서 처리함.
//3기는 mysql과 db를 연동했음. 반드시 백엔드 서버를 실행한 상태에서 프론트를 연결해야함.
//3기는 소스에 존재했던 스크립트를 mysql로 처리하는데 집중했고 나머지는 기존 소스를 최대한 활용함.
//4기는 장바구니 db를 따로 생성하던지 해서 차별점을 두길 바람.

function SelectTea() {
  const [products, setProducts] = useState([]); // 상품 목록 상태
  const [current, setCurrent] = useState({}); // 현재 선택된 상품 상태
  const [isOpen, setIsOpen] = useState(false); // 일반 모달 상태
  const [isOpen_2, setIsOpen_2] = useState(false); // 바코드 모달 상태
  const [isBasketModalOpen, setIsBasketModalOpen] = useState(false); // 장바구니 모달 열림 상태
  const [count, setCount] = useState(1); // 선택된 상품의 수량
  const [isiced, setIsiced] = useState(true); // 선택된 상품의 온도 상태 (아이스/핫)
  const [regular, setRegular] = useState(true); // 선택된 상품의 사이즈 상태 (레귤러/엑스트라)
  const [basket, setBasket] = useState([]); // 장바구니 상태
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalprice, setTotalprice] = useState(0); // 장바구니 내 총 가격
  const [category, setCategory] = useState("밀크티"); // 현재 선택된 카테고리
  const [filtered, setFiltered] = useState([]); // 필터링된 상품 목록 상태
  const [barcodeerror, setBarcodeerror] = useState(false); // 바코드 에러 상태
  const inputRef = useRef();
  const navigate = useNavigate();
  const [barcodes, setBarcodes] = useState([]);
  const [isWarningOpen, setIsWarningOpen] = useState(false); //타임아웃 경고 모달창
  const [modalQuantity, setModalQuantity] = useState(1);
  const [countdown, setCountdown] = useState(5); // 5초부터 시작
  const [cookies, setCookie, removeCookie] = useCookies(["basket","packageType"]);//매장포장
  const [selectedPackageType, setSelectedPackageType] = useState("");//매장포장

  useEffect(() => {
    const fetchProductsAndBarcodes = async () => {
      try {
        const response = await axios.get('http://192.168.10.153:8080/selecttea');
        const allData = response.data;
        // 가정: 제품 정보와 바코드 정보가 분리되어 있지 않아서, 분류가 필요
        const productsOnly = allData.filter(item => !item.barcode); // 바코드가 없는 항목만 제품으로 간주
        const barcodesOnly = allData.filter(item => item.barcode); // 바코드가 있는 항목만 별도로 분류

        console.log("바코드 데이터 목록:", barcodesOnly); // 여기에서 바코드 데이터 목록을 확인합니다.
        console.log(productsOnly);
        setProducts(productsOnly); // 제품 정보만 저장
        // "밀크티" 카테고리에 해당하는 상품만 필터링하여 초기에 표시
        const initialFiltered = productsOnly.filter(product => product.pdCategory === "Milk Tea");
        setFiltered(initialFiltered);
        // 초기 선택된 상품 설정 (옵셔널)
        if (initialFiltered.length > 0) {
          setCurrent(initialFiltered[0]);
        }
        setBarcodes(barcodesOnly); // 바코드 정보만 저장
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProductsAndBarcodes();
    // 초기 카테고리 상태를 "Milk Tea"로 설정
    setCategory("Milk Tea");
  }, []);

  // 타임 아웃 로직
  useEffect(() => {
    let activityTimer;
    let warningTimer;
    let redirectTimer;
    let countdownTimer;

    const resetCountdown = () => {
      clearInterval(countdownTimer);
      setCountdown(5); // 카운트다운을 5초로 재설정
    };

    const startCountdown = () => {
      resetCountdown(); // 기존 카운트다운을 중지하고 재설정
      countdownTimer = setInterval(() => {
        setCountdown((prevCount) => {
          const nextCount = prevCount - 1;
          if (nextCount < 0) {
            clearInterval(countdownTimer); // 카운트다운 종료
            return 0;
          }
          return nextCount;
        });
      }, 1000); // 1초 간격으로 카운트다운
    };

    const handleUserActivity = () => {
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearTimeout(redirectTimer);
      resetCountdown(); // 카운트다운 리셋
      setIsWarningOpen(false); // 경고 모달창 닫기

      activityTimer = setTimeout(() => {
        setIsWarningOpen(true); // 경고 모달창 표시
        startCountdown(); // 카운트다운 시작

        // 조건에 따라 다른 로직 실행
        warningTimer = setTimeout(() => {
          if (isOpen || isOpen_2 || isBasketModalOpen) {
            closeModalHandler();
            close_modal2();
            closeBasketModal();
          } else {
            navigate('/');
          }
          setIsWarningOpen(false); // 경고 모달창 닫기
        }, 5000); // 5초 후 실행

      }, isOpen || isOpen_2 || isBasketModalOpen ? 10000 : 10000); // 모달이 열려있으면 15초, 그렇지 않으면 25초 후 경고 모달창 표시
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    handleUserActivity(); // 컴포넌트 마운트 시 타이머 설정

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearTimeout(redirectTimer);
      clearInterval(countdownTimer);
    };
  }, [navigate, isOpen, isOpen_2, isBasketModalOpen]); // 의존성 배열에 관련 상태 추가

  useEffect(() => {
    // 쿠키에서 장바구니 데이터를 불러올 때 복잡한 변환 로직 없이 바로 사용
    const loadedBasket = cookies.basket || [];
    setBasket(loadedBasket);
  }, [cookies.basket]);

  useEffect(() => {
    // 사용자 활동을 감지하는 함수
    const handleUserActivity = () => {
      clearTimeout(idleTimer); // 기존 타이머를 초기화
      resetTimer(); // 타이머를 재설정
    };

    // 1분 후 홈페이지로 리다이렉션하는 함수
    const redirectToHome = () => {
      navigate('/');
    };

    // 타이머를 리셋하는 함수
    let idleTimer;
    const resetTimer = () => {
      idleTimer = setTimeout(redirectToHome, 600000); // 1분 = 60000ms
    };

    // 초기 타이머 설정
    resetTimer();

    // 이벤트 리스너 추가: 사용자의 활동을 감지
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    // 컴포넌트 언마운트 시 이벤트 리스너와 타이머 제거
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(idleTimer); // 메모리 누수 방지
    };
  }, [navigate]); // navigate 함수가 변경될 경우에만 useEffect를 재실행
  useEffect(() => {
    // 쿠키에서 장바구니 데이터를 불러올 때 복잡한 변환 로직 없이 바로 사용
    const loadedBasket = cookies.basket || [];
    setBasket(loadedBasket);
  }, [cookies.basket]);


  // 쿠키에서 packageType 값 읽기
  useEffect(() => {
    setSelectedPackageType(cookies.packageType || "매장"); // 기본값으로 "매장" 설정
  }, [cookies.packageType]);


//매장포장
// 라디오 버튼 변경 시 쿠키 업데이트하지만, basket 쿠키는 변경하지 않음
  const handlePackageTypeChange = (event) => {
    console.log(`Package type changed to: ${event.target.value}, current basket:`, basket);
    setCookie("packageType", event.target.value, { path: "/" }); // 패키지 타입 쿠키 업데이트

    // basket 상태를 쿠키에 저장
    setCookie("basket", basket, { path: "/" });
    console.log("Basket cookie updated:", basket);
  };

  const openModalHandler = (product) => {
    setCurrent(product);
    setModalQuantity(1); // 모달을 열 때 수량을 1로 초기화
    setIsiced(true); // 모달을 열 때 온도를 기본값으로 설정
    setRegular(true); // 모달을 열 때 사이즈를 Regular로 설정
    setIsOpen(true);
  };

  const closeModalHandler = () => {
    setIsOpen(false);
  };

  // 장바구니 모달창을 표시하는 함수
  const openBasketModal = () => {
    if (basket.length > 0) {
      setIsBasketModalOpen(true);
    } else {
      // 장바구니가 비어있으면 모달을 열지 않습니다.
    }
  };

  // 장바구니 모달창을 닫는 함수
  const closeBasketModal = () => {
    setIsBasketModalOpen(false);
  };

  const changeModalQuantity = (delta) => {
    setModalQuantity(prev => Math.max(1, prev + delta));
  };

// 상품 수량 변경 함수
  const changeModalCount = (delta) => {
    // 새로운 수량을 계산하고 상태를 업데이트합니다.
    setModalQuantity(prev => Math.max(1, prev + delta));
  };

  // 상품을 장바구니에 추가하는 함수
  function addToBasket(product) {
    const newProduct = {
      ...product,
      quantity: modalQuantity,
      size: regular ? "Regular" : "Extra",
      tempature: isiced ? "ICED" : "HOT",
    };

    
    const existingIndex = basket.findIndex((item) =>
      item.pdId === newProduct.pdId &&
      item.size === newProduct.size &&
      item.tempature === newProduct.tempature // Make sure to include tempature in the comparison
    );

    let updatedBasket = [...basket];
    if (existingIndex !== -1) {
      // If product exists, just update the quantity
      updatedBasket[existingIndex].quantity += newProduct.quantity;
    } else {
      // If it doesn't exist, add the new product
      updatedBasket.push(newProduct);
    }

    setBasket(updatedBasket); // Update basket state
    // 장바구니 데이터를 쿠키에 저장할 때 변환 로직 없이 바로 저장
    setCookie('basket', newBasket, { path: '/' });
  }

// 상품 수량 변경 함수
  const changecount = (delta, productId, size, tempature) => {
    // 함수 내부에서 상태를 직접 조작하지 말고, 항상 setState 또는 setBasket 콜백을 사용하세요
    setBasket(prevBasket => {
      const productIndex = prevBasket.findIndex(item =>
        item.pdId === productId &&
        item.size === size &&
        item.tempature === tempature
      );

      if (productIndex !== -1) {
        const newQuantity = prevBasket[productIndex].quantity + delta;
        if (newQuantity <= 0) {
          // 배열에서 제거
          return [...prevBasket.slice(0, productIndex), ...prevBasket.slice(productIndex + 1)];
        } else {
          // 수량 업데이트
          return [
            ...prevBasket.slice(0, productIndex),
            { ...prevBasket[productIndex], quantity: newQuantity },
            ...prevBasket.slice(productIndex + 1)
          ];
        }
      }
      return prevBasket;
    });
  };

// 장바구니에서 상품 수량 1 증가 함수
  function basket_addone(productId, size, tempature) {
    changecount(1, productId, size, tempature);
  }

  function basket_minusone(productId, size, tempature) {
    changecount(-1, productId, size, tempature);
  }

// 장바구니에서 상품 제거 함수
function basket_remove(productId, size, tempature) {
  setBasket(prevBasket => prevBasket.filter(item =>
    !(item.pdId === productId && item.size === size && item.tempature === tempature)
  ));
}

  // 장바구니를 비우는 함수
  const clearBasket = () => {
    setBasket([]); // 장바구니 상태를 빈 배열로 설정
    setCookie('basket', [], { path: '/' }); // 쿠키도 업데이트
  };

  // 상품을 장바구니에 추가하는 함수
  function addToBasketWithModalQuantity() {
    console.log("isiced 상태:", isiced);
    // 현재 모달에서 선택된 상품과 수량을 가져옵니다.
    const productToAdd = {
      ...current,
      quantity: modalQuantity, // 현재 모달에서 설정된 수량
      size: regular ? "Regular" : "Extra", // 선택된 사이즈
      tempature: isiced ? "ICED" : "HOT" // 선택된 온도
    };

    // 장바구니에 이미 같은 상품(동일 ID, 사이즈, 온도)이 있는지 확인합니다.
    const existingProductIndex = basket.findIndex(item =>
      item.pdId === productToAdd.pdId &&
      item.size === productToAdd.size &&
      item.tempature === productToAdd.tempature
    );

    let newBasket = [...basket];
    if (existingProductIndex !== -1) {
      // 이미 있는 상품이면, 수량만 업데이트합니다.
      newBasket[existingProductIndex].quantity += productToAdd.quantity;
    } else {
      // 새 상품이면, 장바구니 배열에 추가합니다.
      newBasket.push(productToAdd);
    }

    // 장바구니 상태와 쿠키를 업데이트합니다.
    setBasket(newBasket);
    setCookie('basket', JSON.stringify(newBasket), { path: '/' });

    // 모달을 닫고 초기 상태로 돌아갑니다.
    closeModalHandler();
  }

  const goToBasket = () => {
    navigate('/basket');
  };


  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.10.153:8080/selecttea');
      console.log("API Response:", response.data); // API 응답 데이터 확인
      setProducts(response.data);
      setFiltered(response.data.filter(product => product.pdCategory === category));
      if (response.data.length > 0) {
        setCurrent(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const change_category = (newCategory) => {
    // 사용자 인터페이스에 표시되는 카테고리 이름을 실제 데이터베이스 카테고리 이름으로 매핑
    let apiCategory = "";
    switch (newCategory) {
      case "밀크티":
        apiCategory = "Milk Tea";
        break;
      case "시그니처":
        apiCategory = "Signature";
        break;
      case "콜드 클라우드":
        apiCategory = "Cold Cloud";
        break;
      case "아이스 블렌디드":
        apiCategory = "Ice Blended";
        break;
      case "과일차":
        apiCategory = "KOKEE Fruit Tea";
        break;
      default:
        apiCategory = newCategory;
    }



    console.log("Changing category to:", apiCategory);
    setCategory(apiCategory);
    // 변경된 apiCategory를 사용하여 필터링
    console.log("Current category state after setCategory call:", category);
    const filteredProducts = products.filter(product => product.pdCategory === apiCategory);
    console.log("Filtered products:", filteredProducts);
    setFiltered(filteredProducts);
  };




  const limittext = (text, limit = 10) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const renderProducts = () => {
    return products.map((product) => (
      <div key={product.pdId} className="product-item">
        <img src={product.image} alt={product.pdName} />
        <div className="product-info">
          <h3>{product.pdName}</h3>
          <p>{`${product.pdPrice}원`}</p>
          <button onClick={() => openModalHandler(product)}>선택하기</button>
        </div>
      </div>
    ));
  };

  // 바코드 모달 열기 함수
  function barcode_open() {
    setIsOpen_2(true);
  }



// 가격 계산 함수 추가
  function calculatePrice(basePrice, quantity) {
    // 이미 상품 가격이 'puttobasket'에서 계산되었으므로 여기서는 수량만 고려합니다.
    return basePrice * quantity;
  }

  function gobuy_basket() {
    if (basket.length > 0) {
      // setCookie를 사용하여 basket 배열을 직접 쿠키에 저장 (JSON.stringify 사용하지 않음)
      setCookie('basket', basket, { path: '/' });
      navigate('/purchase');
    } else {
      // alert('장바구니가 비어 있습니다.');
    }
  }

  const onChange = (e) => {
    const inputBarcode = e.target.value.trim().toUpperCase(); // 입력값을 대문자로 변환하여 양쪽 공백 제거
    // 입력된 바코드의 길이가 10자 이상일 때만 검색을 시도합니다.
    if (inputBarcode.length >= 10) {
      setTimeout(() => {
        let flag = false; // 바코드를 찾았는지 여부를 나타내는 플래그
        // 'barcodes' 배열에서 입력된 바코드와 일치하는 항목을 찾습니다.
        const foundBarcode = barcodes.find(barcodeItem => barcodeItem.barcode.toUpperCase() === inputBarcode);
        console.log("Matching barcode data:", foundBarcode); // 매칭되는 바코드 데이터 로깅

        if (foundBarcode) {
          // 바코드에 해당하는 제품 정보를 찾습니다.
          console.log("test2");
          console.log(foundBarcode.product_name);
          console.log(foundBarcode.id);
          const productData = products.find(product => product.pdId == foundBarcode.id);
          if (productData) {
            console.log("test1");
            setBarcodeerror(false); // 에러 상태를 false로 설정
            console.log(productData);
            setCurrent(productData); // 현재 선택된 상품을 업데이트
            setIsOpen(true); // 제품 정보 모달을 열기
            setIsOpen_2(false); // 바코드 모달을 닫기
            flag = true; // 바코드를 성공적으로 찾음
          }
        }

        if (!flag) {
          // 바코드 또는 해당하는 제품을 찾지 못했다면 에러 표시
          setBarcodeerror(true);
        }
        e.target.value = ''; // 입력 필드 초기화
      }, 100); // 검색을 위한 지연 시간 설정
    }
  };
  // 바코드 모달 닫기 함수
  function close_modal2() {
    setBarcodeerror(false);
    setIsOpen_2(false);
  }
  
  function click_tempature(option) {
    // 현재 온도 상태 변경
    if (option === 'left' && isiced) {
      setIsiced(false); // isiced가 참일 때만 거짓으로 변경
    }
    if (option === 'right' && !isiced) {
      setIsiced(true); // isiced가 거짓일 때만 참으로 변경
    }
  }


  // 사이즈 변경 시 가격 업데이트 함수
  function click_size(option) {
    const extraCost = 500; // Extra 선택 시 추가될 가격
    
    if (option === 'left' && !regular) {
      setRegular(true); 
      setModalPrice(current.pdPrice)
    }
    if (option === 'right' && regular) {
      setRegular(false);
      setModalPrice(current.pdPrice + extraCost)
    }
    
  }


// 장바구니에 상품 추가 함수
  function puttobasket() {
    // 현재 모달에서 선택된 상품의 가격과 수량을 가져옵니다.
    const finalPrice = modalPrice; // 선택된 사이즈에 따라 계산된 가격
    console.log(current);
    // 장바구니에 추가할 새 상품 객체를 생성합니다.
    let newProduct = {
      ...current,
      quantity: modalQuantity,
      pdPrice: finalPrice, // 모달에서 계산된 최종 가격을 사용합니다.
      tempature: isiced ? "ICED" : "HOT",
      size: regular ? "Regular" : "Extra"
    };

    console.log(newProduct);

    // 기존의 장바구니에 동일한 상품이 있는지 확인합니다.
    let existingProductIndex = basket.findIndex(item =>
      item.pdId === newProduct.pdId &&
      item.tempature === newProduct.tempature &&
      item.size === newProduct.size
    );

    // 기존 상품이 장바구니에 있으면 수량만 업데이트합니다.
    if (existingProductIndex !== -1) {
      let updatedBasket = [...basket];
      updatedBasket[existingProductIndex].quantity += modalQuantity;
      setBasket(updatedBasket);
    } else {
      // 새 상품이 장바구니에 없으면 추가합니다.
      setBasket([...basket, newProduct]);
    }

    // 모달을 닫고, 모달에서 사용된 상태를 초기화합니다.
    closeModalHandler();
    setModalQuantity(1);
    setIsiced(true);
    setRegular(true);
    setModalPrice(current.pdPrice); // 모달 가격도 초기 가격으로 다시 설정합니다.
  }

  // 장바구니 내 총 수량 계산
  useEffect(() => {
    const newTotalQuantity = basket.reduce((acc, item) => acc + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
  }, [basket]); // 장바구니 상태가 변경될 때마다 총 수량을 다시 계산


// 장바구니 총 가격 계산 로직을 업데이트하는 useEffect
  useEffect(() => {
    // 장바구니 내의 총 가격을 계산합니다.
    const newTotalPrice = basket.reduce((acc, item) => {
      // 여기서는 이미 최종 가격이 계산된 'item.price'를 사용하므로 추가 비용을 고려할 필요가 없습니다.
      return acc + (item.pdPrice * item.quantity);
    }, 0);

    setTotalprice(newTotalPrice);
  }, [basket]);

  const [modalPrice, setModalPrice] = useState(0);

  useEffect(() => {
    // 현재 선택된 상품의 기본 가격으로 모달 가격을 설정합니다.
    setModalPrice(current.pdPrice);
  }, [current]);


  // 입력창 onBlur 이벤트 핸들러
  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };


  return (
    <div className="st_background">
      <div className="ad">
        <video autoPlay loop muted className="video">
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {/* 첫 번째 모달 */}
      <Modal
        isOpen={isOpen}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "absolute",
            top: "25%",
            left: "7.5%",
            right: "7.5%",
            bottom: "25%",
            border: "1px solid #ccc",
            background: "#fff",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            overflow: "hidden",
            WebkitOverflowScrolling: "touch",
            borderRadius: "5px",
            outline: "none",
            padding: "0px",
          },
        }}
      >
        {/* 모달 내용 */}
        <div className="modal_title">
          옵션 선택(options)
        </div>
        <div className="modal_inside">

          <div className="modal_img_wrap img_shadow">
            <img src={current.image} alt="달고나" className="modal_img img_shadow3" />
          </div>
          {/* 상품 이미지와 이름, 설명, 가격을 올바르게 렌더링 */}
          <p className="modal_name">{current.pdName}</p>
          <p className="bottom_price">
            {(modalPrice * modalQuantity)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            원
          </p>
          {/* 상품 수량 변경 */}
          <div className="modal_counts">
            <img
              src={minus}
              onClick={() => setModalQuantity(prevQuantity => Math.max(prevQuantity - 1, 1))}
              className="modal_button_1"
            ></img>
            <p className="modal_count">{modalQuantity}</p>
            <img
              src={plus}
              onClick={() => setModalQuantity(prevQuantity => prevQuantity + 1)}
              className="modal_button_1"
            ></img>
          </div>
          <br/>
          <br/>
        </div>

        <div className="modal_inside">
        {/* 옵션 선택: 온도와 사이즈 */}
        <div className={current.no_option ? "hidden" : "op"}>
            <div className="modal_tea_options">
              <p className="tempature">1. 온도(hot or ice)</p>
              {current.icedonly ? (
                <>
                <div className={"tempature_btn"}>
                  <img className='hot' src={hotOption1}></img>
                  <p>Hot</p>
                </div>
                <div className={"tempature_btn selected"}>
                  <img className='ice' src={iceOption1}></img>
                  <p>Ice Only</p>
                </div>
                <div className={"card_shadow left"}></div>
                <div className={"card_shadow right selected"}></div>
                </>
              ) : (
                <>
                  <div
                  className={isiced ? "tempature_btn" : "tempature_btn selected"}
                  onClick={() => click_tempature('left')}
                  >
                    <img className='hot' src={hotOption1}></img>
                    <p>Hot</p>
                  </div>
                  <div
                  className={isiced ? "tempature_btn selected" : "tempature_btn"}
                  onClick={() => click_tempature('right')}
                  >
                    <img className='ice' src={iceOption1}></img>
                    <p>Ice</p>
                  </div>
                  <div className={isiced ? "card_shadow left" : "left card_shadow selected"}
                  onClick={() => click_tempature('left')}></div>
                  <div className={isiced ? "card_shadow right selected" : "card_shadow right"}
                  onClick={() => click_tempature('right')}></div>
                </>
              )}
            </div>
            <div className="modal_tea_options">
              <p className="text_size">2. 사이즈(size)</p>
              <div
                className={regular ? "size_btn selected_size" : "size_btn"}
                onClick={() => click_size('left')}
              >
                <img className='re' src={coffee1}></img>
                <p>Regular</p>
              </div>
              <div
                className={
                  regular ? "size_btn extra" : "size_btn extra selected_size"
                }
                onClick={() => click_size('right')}
              >
                <img className='ex' src={extra1}></img>
                <p>Extra</p>
                <p className="ex500">+500{current.extra_price}</p>
              </div>
              <div className={regular ? "card_shadow left selected" : "left card_shadow"}
                  onClick={() => click_size('left')}></div>
                  <div className={regular ? "card_shadow right" : "card_shadow right selected"}
                  onClick={() => click_size('right')}></div>
            </div>
          </div>
        </div>
        <div className="bottom_buttons">
            <p onClick={closeModalHandler} className="bottom_buy buy_back">
              이전<br />(Back)
            </p>
            <p onClick={puttobasket} className="bottom_buy buy_add">
              담기<br />(Add)
            </p>
        </div>
      </Modal>

      {/* 장바구니 모달 */}
      <Modal
        isOpen={isBasketModalOpen}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "absolute",
            top: "20%",
            left: "7.5%",
            right: "7.5%",
            bottom: "20%",
            border: "1px solid #ccc",
            background: "#fff",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            overflow: "hidden",
            WebkitOverflowScrolling: "touch",
            borderRadius: "5px",
            outline: "none",
            padding: "0px",
          },
        }}
      >
        {/* 모달 내용 */}
        <div className="modal_title2">
          주문 내역을 확인해주세요.
        </div>
        <div className="basket2">
        {basket.map((item, index) => (
          <div className="basket_item2" key={`${item.pdId}_${item.size}_${item.tempature}`}>
            
            <div className="basket_img_wrap2 img_shadow2">
              <img src={item.image} className="basket_img img_shadow2" alt={item.pdName}/>
            </div>
            <p className="basket_modal_name">{item.tempature === "ICED" ? "(Ice) " : "(Hot)"}{item.pdName}{item.size === "Regular" ? "(R)" : "(L)"}</p>
            <p className="basket_modal_quantity">{item.quantity}</p>
            <p className="basket_modal_price">{(item.quantity * item.pdPrice).toLocaleString()}원</p>
            <img src={closebtn} className="modal_closebtn"
                onClick={() => basket_remove(item.pdId, item.size, item.tempature)}/>  
          </div>
        ))}
      </div>
        <div className="text_box2 pl_bm">
          <p>총수량 : &nbsp;</p>
          <p>{totalQuantity}개</p>
        </div>
        <div className="text_box2 pr_bm">
          <p>총금액 : &nbsp;</p>
          <p>{totalprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</p>
        </div>
        <div className="bottom_buttons">
            <p onClick={closeBasketModal} className="bottom_buy buy_back">
              이전<br />(Back)
            </p>
            <p onClick={gobuy_basket} className="bottom_buy buy_add">
              결제하기<br />(Pay)
            </p>
        </div>
      </Modal>

      {/* 바코드 모달 */}
      <Modal
        isOpen={isOpen_2}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "absolute",
            top: "27.5%",
            left: "7.5%",
            right: "7.5%",
            bottom: "27.5%",
            border: "1px solid #ccc",
            background: "#fff",
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            overflow: "hidden",
            WebkitOverflowScrolling: "touch",
            borderRadius: "5px",
            outline: "none",
            padding: "0px",
          },
        }}
      >
        {/* 바코드 모달 내용 */}
        <div className="modal_title barcode">
          바코드 읽기(Barcode Reader)
        </div>
        <div className="modal_inside">

          <div className="barcode_center2">
            {/* 바코드 입력창 */}
            <img src={barcode1} className="barcode_modal_img"></img>
          </div>
          <p className={barcodeerror ? "barcode_txt red_txt" : "barcode_txt"}>
            {barcodeerror
              ? "등록되지 않은 상품입니다."
              : ""}
          </p>
          <div className="barcode_center">
            <label>
              바코드 : &nbsp;
            </label>
            <input
              type="text"
              className="barcode_input"
              ref={inputRef}
              onBlur={handleBlur}
              onChange={onChange}
              autoFocus
            ></input>
          </div>

        </div>
        <div className="modal_inside">
            <div className="text_wrap3">
          <p>
          키오스크 좌측에
          <br />
          바코드 리더가 있습니다.
          <br />
          제품 바코드를
          <br />
          여기에 스캔하세요.
          <br />
          <br />
          Barcode reader
          <br />
          is located on the left.
          <br />
          Scan your
          <br />
          product barcode here.
          </p>
        </div>
          </div>
        <div className="bottom_buttons barcode">
            <p onClick={close_modal2} className="bottom_buy buy_back">
              이전<br />(Back)
            </p>
        </div>
      </Modal>

      {/*타임 아웃 경고 모달*/}
      <Modal
        isOpen={isWarningOpen}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            position: "absolute",
            top: "40%",
            left: "10%",
            right: "10%",
            bottom: "40%",
            border: "1px solid #ccc",
            background: "#fff",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "20px",
            outline: "none",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <div className='time_modal'>
          <p>고객님께서 일정 시간 동안 활동이 없어 안내드립니다.</p>
          <p>{countdown}초 후 이전 화면으로 자동 이동됩니다.</p>
          <p>계속 이용하시려면 화면을 터치해주세요.</p>
        </div>
      </Modal>

      <div className="navbar">
        {/* <img className="kokee_logo" src="/img/코키티 로고.png"></img> */}
        <h2>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            KOKEE TEA
          </Link>
        </h2>
        <br />
        <div className="navbar_buttons">
          <button className={category === "Milk Tea" ? "reset_button cat_selected" : "reset_button"}
                  onClick={() => change_category("밀크티")}>밀크티
          </button>
          <button className={category === "Signature" ? "reset_button cat_selected" : "reset_button"}
                  onClick={() => change_category("시그니처")}>시그니처
          </button>
          <button className={category === "KOKEE Fruit Tea" ? "reset_button cat_selected" : "reset_button"}
                  onClick={() => change_category("과일차")}>과일차
          </button>
          <button className={category === "Cold Cloud" ? "reset_button cat_selected" : "reset_button"}
                  onClick={() => change_category("콜드 클라우드")}>콜드 클라우드
          </button>
          <button className={category === "Ice Blended" ? "reset_button cat_selected" : "reset_button"}
                  onClick={() => change_category("아이스 블렌디드")}>아이스 블렌디드
          </button>
        </div>
      </div>
      <div className="tea_list">
        <ul>
        {/* filtered 배열을 이용해 현재 선택된 카테고리에 맞는 상품 목록을 렌더링 */}
        {filtered.map((product, index) => (
          <li key={index}>
            <div className="tea_list_item" onClick={() => openModalHandler(product)}>
              <div className="img_wrap img_shadow">
                <img src={product.image} alt={product.pdName} className="tea_list_img img_shadow2"/>
              </div>
              <p className="tl_item_name">{product.pdName}</p>
              <span class="material-symbols-outlined search">search</span>
            </div>
          </li>
        ))}
        </ul>
        
        <div className="basket_wrap">
        <div className="basket_title">
            <span class="material-symbols-outlined cart_icon">
              shopping_cart
            </span>
            <span>주문내역</span> 
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="btnradio1"
                value="매장"
                checked={selectedPackageType === "매장"}
                onChange={handlePackageTypeChange}
                autoComplete="off"
              />
              <label className={`btn ${cookies.packageType !== "매장" ? "매장" : "active"}`} htmlFor="btnradio1">매장</label>

              <input
                type="radio"
                className="btn-check"
                name="btnradio"
                id="btnradio2"
                value="포장"
                checked={selectedPackageType === "포장"}
                onChange={handlePackageTypeChange}
                autoComplete="off"
              />
              <label className={`btn ${cookies.packageType === "매장" ? "매장" : "active"}`} htmlFor="btnradio2">포장</label>
            </div>
        </div>

        <div className="basket">
        {basket.map((item, index) => (
          <div className="basket_item" key={`${item.pdId}_${item.size}_${item.tempature}`}> {/* 항상 고유한 키를 사용하세요. */}
            
            <div className="basket_img_wrap img_shadow2">
              <img src={item.image} className="basket_img img_shadow2" alt={item.pdName}/>
            </div>
            
            <div className="basket_ect_wrap">
              <div className="basket_ect">
                <p className="ect_pl">{item.tempature === "ICED" ? "(Ice) " : "(Hot)"}{item.pdName}{item.size === "Regular" ? "(R)" : "(L)"}</p>
                <img src={closebtn} className="basket_btn basket_remove ect_pr"
                onClick={() => basket_remove(item.pdId, item.size, item.tempature)}/>
              </div>

              <div className="basket_ect">
                <div className="plma ect_pl">
                  <img src={minus} className="basket_btn basket_minusone"
                  onClick={() => basket_minusone(item.pdId, item.size, item.tempature)}/>
                  <span className="basket_btn basket_count">{item.quantity}</span>
                  <img src={plus} className="basket_btn basket_addone"
                  onClick={() => basket_addone(item.pdId, item.size, item.tempature)}/>
                </div>
                <p className="ect_pr">{(item.quantity * item.pdPrice).toLocaleString()}원</p>
              </div>
            </div>  
          </div>
        ))}
      </div>

        <div  className="basket_buy">
          <div className="text_box">
            <p>총수량 : </p>
            <p>{totalQuantity}개</p>
          </div>
          <div className="text_box">
            <p>총금액 : </p>
            <p>{totalprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원</p>
          </div>
          
          <div className="pay_btn" onClick={openBasketModal}>
          <span class="material-symbols-outlined">receipt_long</span>
            결제하기</div>
          {/* <div className="pay_btn" onClick={gobuy_basket}>결제하기(Pay)</div> */}
          <div className="back_btn">
            <span class="material-symbols-outlined">home</span>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              처음으로
            </Link>
          </div>
          <div className='barcode_btn2' onClick={barcode_open}>
            <span class="material-symbols-outlined" >barcode_scanner</span>
            바코드 읽기
          </div>
          <div className='trash' onClick={clearBasket}>
            <span class="material-symbols-outlined" >delete</span>
            비우기
          </div>
          
        </div>

      </div>

      </div>

    </div>
  );
}

export default SelectTea;

