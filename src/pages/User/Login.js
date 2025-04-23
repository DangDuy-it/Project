import React from "react";

import Notification from "../../components/Notification";
import LoginForm from "../../components/LoginForm";
function Login(){
    return(
        <div className="content">
            <Notification/>
            <LoginForm/>
        </div>

    )
}
export default Login;