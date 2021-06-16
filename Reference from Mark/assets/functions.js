const renderLoginForm = () => {
    const form = document.createElement('form')

    const loginText = document.createElement('p')
    loginText.textContent = 'Log In'
    loginText.id = 'login-text'
    form.appendChild(loginText)

    const loginContainer = document.createElement('div')
    loginContainer.id = 'login-container'
    form.appendChild(loginContainer)

    const usernameInput = document.createElement('input')
    usernameInput.id = 'username-input'
    usernameInput.placeholder = 'Email'
    loginContainer.appendChild(usernameInput)

    const passwordInput = document.createElement('input')
    passwordInput.setAttribute('type', 'password')
    passwordInput.id = 'password-input'
    passwordInput.placeholder = 'Password'
    loginContainer.appendChild(passwordInput)

    const loginButton = document.createElement('button')
    loginButton.id = 'login-button'
    loginButton.textContent = 'LOGIN'
    loginButton.addEventListener('click', e => {
        e.preventDefault()

        const user = users.findIndex(user => {
            return usernameInput.value === user.email && CryptoJS.SHA1(passwordInput.value).toString() === user.password
        })

        if (user === -1) {
            alert('Wrong credentials.')
        } else {
            renderDashboard(users[user].id)
        }
    })
    loginContainer.appendChild(loginButton)

    const registerText = document.createElement('p')
    registerText.textContent = 'Not registered? '
    registerText.id = 'register-text'

    const registerLink = document.createElement('a')
    registerLink.textContent = ' Create an Account'
    registerLink.id = 'register-link'
    registerText.appendChild(registerLink)
    registerLink.addEventListener('click', e => {
        renderSignUpForm()
    })

    loginContainer.appendChild(registerText)
    document.querySelector('#container').appendChild(form)
}

const renderSignUpForm = () => {
    const form = document.querySelector('form')
    form.textContent = ''

    const signupText = document.createElement('p')
    signupText.textContent = 'Sign Up'
    signupText.id = 'signup-text'
    form.appendChild(signupText)

    const signupContainer = document.createElement('div')
    signupContainer.id = 'login-container'
    form.appendChild(signupContainer)

    const fullNameInput = document.createElement('input')
    fullNameInput.id = 'name-input'
    fullNameInput.required = true
    fullNameInput.placeholder = 'Full Name'
    signupContainer.appendChild(fullNameInput)

    const emailInput = document.createElement('input')
    emailInput.setAttribute('type', 'email')
    emailInput.required = true
    emailInput.id = 'email-input'
    emailInput.placeholder = 'Email'
    signupContainer.appendChild(emailInput)

    const passwordInput = document.createElement('input')
    passwordInput.setAttribute('type', 'password')
    passwordInput.required = true
    passwordInput.id = 'password-input'
    passwordInput.placeholder = 'Password'
    signupContainer.appendChild(passwordInput)

    const confirmPassword = document.createElement('input')
    confirmPassword.setAttribute('type', 'password')
    confirmPassword.required = true
    confirmPassword.id = 'password-confirmation-input'
    confirmPassword.placeholder = 'Confirm Password'
    signupContainer.appendChild(confirmPassword)

    const signupButton = document.createElement('button')
    signupButton.id = 'signup-button'
    signupButton.textContent = 'SIGN UP'
    signupButton.addEventListener('click', e => {
        e.preventDefault()
        if ((passwordInput.value === confirmPassword.value) && passwordInput.value.length >= 8) {
            alert('Thanks for signing up!')
            createUser(fullNameInput.value, emailInput.value, passwordInput.value)
            saveUser()
            document.querySelector('form').textContent = ''
            renderLoginForm()
        } else if (passwordInput.value.length < 8) {
            alert('Password should be atleast 8 characters')
            passwordInput.value = ''
            confirmPassword.value = ''
        } else if (passwordInput.value !== confirmPassword.value) {
            alert('Password and password confirmation do not match.')
            passwordInput.value = ''
            confirmPassword.value = ''
        }
        e.preventDefault()
    })
    signupContainer.appendChild(signupButton)

    document.querySelector('#container').appendChild(form)
}

const renderDashboard = id => {
    const userIndex = users.findIndex(user => user.id === id)
    const user = users[userIndex]

    document.querySelector('body').textContent = ''

    const dashboardContainer = document.createElement('div')
    dashboardContainer.id = 'dashboard-container'

    const imageContainer = document.createElement('div')
    imageContainer.id = 'image-container'

    const image = document.createElement('img')
    image.id = 'user-image'
    image.setAttribute('src', 'assets/images/user-image.png')
    imageContainer.appendChild(image)

    const name = document.createElement('p')
    name.id = 'user-name'
    name.textContent = user.fullName
    imageContainer.appendChild(name)

    const balance = document.createElement('p')
    balance.id = 'user-balance'
    balance.textContent = `Balance: $ ${user.balance}`
    imageContainer.appendChild(balance)

    const actionsContainer = document.createElement('div')
    actionsContainer.id = 'actions-container'

    const depositButton = document.createElement('button')
    depositButton.id = 'deposit-button'
    depositButton.textContent = 'Deposit'
    depositButton.addEventListener('click', e => {
        e.preventDefault()
        const amount = Number(prompt('Deposit Amount:'))
        user.deposit(amount)
        getUsers()
        balance.textContent = `Balance: $ ${user.balance}`
    })
    actionsContainer.appendChild(depositButton)

    const withdrawButton = document.createElement('button')
    withdrawButton.id = 'withdraw-button'
    withdrawButton.textContent = 'Withdraw'
    withdrawButton.addEventListener('click', e => {
        e.preventDefault()
        const amount = Number(prompt('Deposit Amount:'))
        user.withdraw(amount)
        getUsers()
        balance.textContent = `Balance: $ ${user.balance}`
    })
    actionsContainer.appendChild(withdrawButton)

    const sendButton = document.createElement('button')
    sendButton.id = 'send-button'
    sendButton.textContent = 'Send'
    sendButton.addEventListener('click', e => {
        e.preventDefault()
        const id = prompt('Receiver ID:')
        const amount = Number(prompt('Send Amount:'))
        user.send(id, amount)
        getUsers()
        balance.textContent = `Balance: $ ${user.balance}`
    })
    actionsContainer.appendChild(sendButton)
    
    const expenseContainer = document.createElement('div')
    expenseContainer.id = 'expense-container'

    const addExpenseItemButton = document.createElement('button')
    addExpenseItemButton.id = 'add-expense-button'
    addExpenseItemButton.textContent = 'Add Expense Item'
    addExpenseItemButton.addEventListener('click', e => {
        e.preventDefault()
        const item = prompt('Item:')
        const amount = Number(prompt('Expense Amount:'))
        user.addExpense(item, amount)
        getUsers()
        balance.textContent = `Balance: $ ${user.balance}`
    })
    expenseContainer.appendChild(addExpenseItemButton)

    const expenseItemsContainer = document.createElement('div')
    expenseContainer.id = 'expenseItemsContainer'

    const listButton = document.createElement('button')
    listButton.id = 'list-button'
    listButton.textContent = 'List Items'
    listButton.addEventListener('click', e => {
        if (expenseItemsContainer) {
            expenseItemsContainer.textContent = ''
        }
        expenseItemsContainer.appendChild(user.listItems())

        expenseContainer.appendChild(expenseItemsContainer)
    })
    expenseContainer.appendChild(listButton)

    dashboardContainer.appendChild(imageContainer)
    dashboardContainer.appendChild(actionsContainer)
    dashboardContainer.appendChild(expenseContainer)
    document.querySelector('body').appendChild(dashboardContainer)
}

const createUser = (fullName, email, password) => {
    users.push(new User(fullName, email, CryptoJS.SHA1(password).toString(), uuidv4()))
    saveUser()
}

const saveUser = () => localStorage.setItem('users', JSON.stringify(users))

const getUsers = () => JSON.parse(localStorage.getItem('users')) || []

const saveItems = () => localStorage.setItem('items', JSON.stringify(expenseItems))

const getItems = () =>  JSON.parse(localStorage.getItem('items')) || []