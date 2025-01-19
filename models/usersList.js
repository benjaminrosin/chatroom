
module.exports = (function () {
    const users = [{email:"benjamin.rosin@gmail.com"}];

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
        console.log(user);
        if (!findUser(user.email)){
            users.push(user);
            return true;
        }
        return false;
    }

    function findUser(email) {
        const val = users.some(user => user.email === email);
        console.log(val);
        console.log(users);
        return val;
    }

    return{
        USER,
        addUser,
        findUser,
    };
})();