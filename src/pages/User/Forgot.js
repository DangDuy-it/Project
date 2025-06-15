import React from "react";

import Notification from "../../components/Notification";
import ForgotPassword from "../../components/ForgotPassword";

function Forgot() {
    return (
        <div className="content">
            <Notification />
            <ForgotPassword />
        </div>
    );
}

export default Forgot;