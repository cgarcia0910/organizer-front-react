import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import styles from './login-feature.module.scss';

export function LoginFeature() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const onlogin = () => {
    if(login('','')) {
      navigate('/', {replace: true})
    }
  }
  return (
    <div className={styles['container']}>
      <h1>Welcome to LoginFeature!</h1>
      <button onClick={onlogin}>login</button>
    </div>
  );
}

export default LoginFeature;
