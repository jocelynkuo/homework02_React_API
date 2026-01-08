import { useState } from "react";
import axios from "axios";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
import "./assets/style.css";

function App() {
  //下面這個是幹嘛的？
  const [count, setCount] = useState(0);
  //表單登入狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  //登入狀態管理(控制顯示登入或產品頁)
  const [isAuth, setIsAuth] = useState(false);
  //產品資料狀態
  const [products, setProducts] = useState([]);
  //目前選中的產品
  const [tempProduct, setTempProduct] = useState(null);

  //抓取輸入的資料
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // React 不了解？ 回頭看
    setFormData((preData) => ({
      ...preData,
      [id]: value,
    }));
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      console.log(response);
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      console.log(response.data);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      //
      getProducts();
      setIsAuth(true);
    } catch (error) {
      console.log(error.response);
      setIsAuth(false);
    }
  };

  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken"))
        ?.split("=")[1];
      //為什麼這邊還要再把token存到header一次？前面不是onSubmit的時候已經存過了？
      axios.defaults.headers.common["Authorization"] = token;

      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <form className="card p-4" style={{ width: "500px" }}>
            <h1 className="h3 mt-3 text-center">後台登入</h1>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username" //label綁定
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                vaule={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button
              type="button"
              className="btn btn-primary w-100 mt-4"
              onClick={(e) => onSubmit(e)}
            >
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div>
            <button
              type="button"
              className="btn btn-info mt-4"
              onClick={() => checkLogin()}
            >
              檢查是否登入?
            </button>
          </div>
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
        //
      )}
    </>
  );
}

export default App;
