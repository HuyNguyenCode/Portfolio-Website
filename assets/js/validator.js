/*B1: Tạo hàm Validator nhận vào một object tên là "options"*/

//Hàm Validator (constructor function)
function Validator(options) {

    // Save lại các rules cho mỗi input
    var selectorRules = {};

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    //B3: Tạo Hàm thực hiện validate
    function validate (inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessages;

        /* Get ra các rules của selector*/
        var rules = selectorRules[rule.selector];

        // Iterate qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':                    
                case 'checkbox':
                    errorMessages = rules[i] (
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
            
                default:
                    errorMessages = rules[i] (inputElement.value);
            }
            if (errorMessages) break;
        }

        if (errorMessages) {
            errorElement.innerText = errorMessages;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        }

        return !errorMessages;
    }

    //Hàm thực hiện unvalidate
    function unvalidate (inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        if (getParent(inputElement, options.formGroupSelector).classList.contains("invalid")) {
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
            errorElement.innerText = " ";
        }
    }

    //B2: Get ra các element của form cần validate (options đại diện cho object truyền vào)
    var formElement = document.querySelector(options.form); /* lấy ra key "form" của object truyền vào - options,
                                                                                => lấy ra form của object */
    if (formElement) {

        formElement.onsubmit = (e) => {
            e.preventDefault();
            // console.log(formElement);

            var isFormValid = true; //Check xem nếu có rule nào đó có lỗi thì không cho phép việc submit thành công

            //Iterate qua từng rule và validate hết tất cả các inputElement
            options.rules.forEach((rule) => { 
                var inputElement = formElement.querySelector(rule.selector);
                if(document.querySelector(rule.selector).value == "") {
                    validate(inputElement, rule);
                    isFormValid = false;
                };

            });

            
            console.log(isFormValid);

            
        //     if (isFormValid) {
        //         options.rules.forEach((rule) => { 
        //             console.log(rule);
        //             var inputElement = formElement.querySelector(rule.selector);
        //             validate(inputElement, rule);
        //         });
        //    }

            // if (isFormValid) {
            //     //Trường hợp submit với JS
            //     if (typeof options.onSubmit === 'function') {
            //         var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    
            //         var formValues = Array.from(enableInputs).reduce((values, input) => {
            //             switch (input.type) {
            //                 case 'radio': 
            //                     values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
            //                     break;
            //                 case 'checkbox': 
            //                     if (!input.matches(':checked')) {
            //                         values[input.name] = '';
            //                         return values
            //                     };

            //                     if (!Array.isArray(values[input.name])) {
            //                         values[input.name] = [];
            //                     }
            //                     break;
            //                 case 'file':
            //                     values[input.name] = input.files;
            //                     break;
            //                 default:
            //                     values[input.name] = input.value;
            //             }

            //             return values;
            //         }, {})

            //         options.onSubmit(formValues);
    
            //     } else { //Trường hợp submit với hành vi mặc định
            //         formElement.submit();
            //     }
            // }
        }


        /*Vì rules có giá trị là một mảng, nên mỗi return của các method trong rules là một phần tử của mảng
        mà những method này nhận vào selector trong DOM để get ra element trong JS, để duyệt qua các elements đó
        thì dùng forEach  
        Duyệt qua từng rules để lấy ra các element cần được set rules  */
        options.rules.forEach((rule) => {

            // Save lại các rules cho mỗi input 
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector); /*rule.selector là lấy ra selector 
            của mỗi phần tử trong mảng mà forEach duyệt qua
             */

            Array.from(inputElements).forEach(function (inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = () => {
                    // value: inputElement.value
                    // test func: rule.test
                    /*Ý tưởng là truyền value nhận được vào trong func test để kiểm tra người dùng nhập value có hợp
                    lệ hay không, để làm được việc đó thì cần:
                        +) inputElement để lấy ra value từ các selector
                        +) rule để lấy ra test funct
                    => Tại test funct nhận vào value để check, mà value thì lấy từ đây      
                    */
                    validate(inputElement, rule);
                     /*Khi blur gọi hàm validate, truyền vào selector của element
                    và  truyền vào hàm test bằng cách truyền vào rule để lấy ra test từ rule*/
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = () => {
                    unvalidate(inputElement, rule);
                }
            });
            // console.log(rule);
        });

        // console.log(selectorRules);
    }
}

//Định nghĩa các rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => thì trả ra message lỗi
// 2. Khi hợp lệ => thì không trả ra cái gì cả (undefined)

/*Bản thân function cũng là một object nên ta có thể gọi đến các method của nó thông qua cú pháp 
tên_funtion.method = function để định cho method đó

//Do bên kia truyền vào selector nên hàm này nhận vào một biến tên là selector, và return lại rules được
apply lên selector truyền vào đó
*/
Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            /*Nếu value hợp lệ thì trả về undefined, không hợp lệ thì trả về message báo lỗi */
            return (value ? undefined : message || 'Please enter this field');
        }
    }
}

Validator.isEmail = (selector) => { //Do bên kia truyền vào selector nên hàm này nhận vào một biến tên là selector
    return {
        selector: selector, //Trả về một selector là chính selector truyền vào luôn
        test: (value) => { //Trả về một function là nội dung của rules apply vào selector
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return (value === "" || regex.test(value)) ? undefined : 'Please enter a valid email';
        }
    }
}

Validator.isPhoneNumber = (selector) => {
    return {
        selector: selector, 
        test: (value) => { 
            var regex = /^\d{10}$/;
            return (value === "" || regex.test(value)) ? undefined : 'Please enter a valid phone number';
        }
    }
}

Validator.minLength = (selector, min, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}