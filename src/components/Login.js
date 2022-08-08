import styled from 'styled-components';
import useLogin from "../hooks/useLogin.js";
import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";

const CenterDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Login = () => {
  const [{ login, loggedIn, loading }] = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // try login
    const localUser = localStorage.getItem('loginUser');
    const localPass = localStorage.getItem('loginPass');
    if (localPass && localUser) {
      document.getElementById('username').value = localUser;
      document.getElementById('password').value = localPass;
      setUsername(localUser);
      setPassword(localPass);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!loggedIn) {
        alert('wrong creds');
      }
    }
  }, [loading]);

  const submitButton = () => {
    login(username, password);
  }
  if (loggedIn) {
    return <Navigate to='/book-search' />
  }
  return (<CenterDiv>
    <h1>Raspi Web UI</h1>
    <label htmlFor="username">Username</label><br />
    <input type="text" id="username" onChange={e => setUsername(e.target.value)}/> <br/><br/>
    <label htmlFor="password">Password</label><br />
    <input type="password" id="password" onChange={e => setPassword(e.target.value)}/> <br />
    <input type="submit" id="login" value="Login" onClick={submitButton}/>
  </CenterDiv>);
}

export default Login;