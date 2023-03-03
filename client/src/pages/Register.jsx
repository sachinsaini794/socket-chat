import { useContext } from "react";
import {Alert, Button, Form, Row, Col, Stack} from "react-bootstrap"
import { AuthContext } from "../context/AuthContext";

const Register = () => {

    const {registerInfo, updateRegisterInfo, registerUser, registerErr, isRegisterLoading} = useContext(AuthContext);

    return <>
    <Form onSubmit={registerUser}>
        <Row style={{ 
            height:"100vh",
            justifyContent: "center",
            paddingTop: "10%"
         }}>
            <Col xs={6}>
                <Stack gap={3}>
                    <h2>Register</h2>
                    <Form.Control type="text" placeholder="name" onChange={(e) => updateRegisterInfo({
                        ...registerInfo, name: e.target.value
                    })} />
                    <Form.Control type="email" placeholder="email" onChange={(e) => updateRegisterInfo({
                        ...registerInfo, email: e.target.value
                    })} />
                    <Form.Control type="text" placeholder="password" onChange={(e) => updateRegisterInfo({
                        ...registerInfo, password: e.target.value
                    })} />
                    <Button variant="primary" type="submit">
                        {isRegisterLoading ? "Creating your account": "Register"}
                    </Button>
                    {
                        registerErr?.error && <Alert variant="danger">
                        <p>{registerErr?.message}</p>
                    </Alert>
                    }
                    
                </Stack>
            </Col>
        </Row>
    </Form>
    </>
}
 
export default Register;