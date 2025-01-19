
module.exports = (function () {
    const users = [];

    class USER{
        constructor(reqBody) {
            this.email = reqBody.email;
            this.fname = reqBody.first_name;
            this.lname = reqBody.last_name;
            this.password = reqBody.password;
        }
        setPassword(password) {
            this.password = password;
        }
    }
    function addUser(user) {
        if (!findUser(user.email)){
            users.push(user);
            return true;
        }
        return false;
    }

    function findUser(email) {
        return users.find(user => user.email === email);
    }

    return{
        USER,
        addUser,
        findUser,
    };
})();