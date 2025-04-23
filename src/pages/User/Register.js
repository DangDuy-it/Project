import React from "react";

import Notification from "../../components/Notification";
import RegisterForm from "../../components/RegisterForm";

function register(){
    return(
        <div className="content">
            <Notification/>
            <RegisterForm/>
        </div>
    )
}
export default register;