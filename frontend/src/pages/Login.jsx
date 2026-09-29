import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaCircleNotch, FaCaretRight } from "react-icons/fa";

import logo from "../images/logo.png";
import "./../Login.css";

function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://rs-management-vgcw.onrender.com/api/students/login",
        {
          studentId,
          password,
        },
        {
          withCredentials: true,
        },
      );

      console.log("Login Response:", response.data);

      if (response.data.success) {
  localStorage.setItem(
    "student",
    JSON.stringify(response.data.student)
  );

  navigate("/overall-result", {
    replace: true,
  });
} else {
        setError(response.data.message || "Invalid Student ID or Password");
      }
    } catch (error) {
      console.log("Login Error:", error.response?.data);

      setError(
        error.response?.data?.message || "Invalid Student ID or Password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-warpper">
      <div className="single-widget-container">
        {/* login-widget section */}
        <section className="widget login-widget">
          {/* =====================================
              BACKGROUND LOGO
          ====================================== */}
          <div className="login-logo">
            <img src={logo} alt="Northern University Logo" />
          </div>

          {/* HEADER */}
          <header className="text-align-center">
            <h3>Login to your Account</h3>
          </header>

          {/* BODY */}
          <div className="body">
            <form className="no-margin" onSubmit={handleLogin}>
              <fieldset>
                {/* ==============================
                    STUDENT ID
                =============================== */}

                <div className="form-group">
                  <label htmlFor="username">ID</label>

                  <div className="input-group">
                    <span className="input-group-addon">
                      <FaUser />
                    </span>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-control input-lg input-transparent"
                      placeholder="Your ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* ==============================
                    PASSWORD
                =============================== */}

                <div className="form-group">
                  <label htmlFor="password">Password</label>

                  <div className="input-group input-group-lg">
                    <span className="input-group-addon">
                      <FaLock />
                    </span>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-control input-lg input-transparent"
                      placeholder="Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* ==============================
                    ERROR
                =============================== */}

                {error && <div className="login-error">{error}</div>}
              </fieldset>

              {/* ==============================
                  FORM ACTIONS
              =============================== */}

              <div className="form-actions">
                {/* <button
                  type="submit"
                  className="btn btn-block btn-lg btn-success"
                  disabled={loading}
                >
                  <span className="small-circle">
                    {loading ? (
                      <FaCircleNotch className="fa-spin" />
                    ) : (
                      <FaCaretRight />
                    )}
                  </span>

                  <small>{loading ? "Signing In..." : "Sign In"}</small>
                </button> */}
                <button
  type="submit"
  className="btn btn-block btn-lg btn-success"
  disabled={loading}
>
  {!loading && (
    <span className="small-circle">
      <FaCaretRight />
    </span>
  )}

  <small>{loading ? "Signing In..." : "Sign In"}</small>
</button>


                <a
                  className="forgot"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Username or Password?
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
      {/* <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br /> */}
      {/* footer section  */}
      <div className="content footer-container">
        <div className="footer-row">
          {/* LEFT FOOTER */}
          <div className="footer-left">
            <div className="small-box bg-green">
              © 2016{" "}
              <a
                href="http://www.nub.ac.bd"
                className="small-box-footer"
                target="_blank"
                rel="noreferrer"
              >
                Northern University of Business &amp; Technology Khulna.
              </a>
              &nbsp;&nbsp; All Rights Reserved.
            </div>
          </div>

          {/* RIGHT FOOTER */}
          <div className="footer-right">
            <div className="small-box bg-green">
              Designed &amp; Developed By :{" "}
              <a
                href="https://nub.ac.bd/index.php?/nub/itdepartment"
                target="_blank"
                rel="noreferrer"
                className="small-box-footer"
              >
                NUB IT
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
