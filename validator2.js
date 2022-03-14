
function Validator(formSelector) {
    // Tu khoa thi la doi tuong duoc khoi tao tu khi goi tu khoa new voi cai contructor function la Validator.
    // Va tu khoa this o trong contructor function do no se tuong ung voi chinh doi tuong ma no tao ra.
    //tips de su dung this keyword trong function khac
    var _this = this;

    function getParent(element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {};

    // Quy uoc tao rule:
    // - Neu co loi thi return `error message`
    // - neu khong co loi thi return `undefined`
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Enter this field, please!';
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'This field must be email';
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Enter minimize ${min} character, please!`;
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Enter maximum ${max} character, please!`;
            }
        }
    };
    var ruleName = 'required';


    //take out form element in DOM as `formSelector`
    var formElement = document.querySelector(formSelector);

    //Only handle when formElement in DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs) {
            var rules = input.getAttribute("rules").split('|');

            for (var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];

                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }


                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            //listen event to validate (blur, change,...)

            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        //function to conduct validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            rules.some(function (rule) {
                errorMessage = rule(event.target.value);
                return errorMessage;
            })

             // for(var rule of rules) {
            //     errorMessage = rule(event.target.value)

            //     if(errorMessage) {
            //         break;
            //     }
            // } 
            // console.log(errorMessage)


            for (var i = 0; i < rules.length; i++) {
                switch (event.target.type) {
                    case 'radio':
                    case 'checkbox':
                        errorMessage = rules[i](
                            formElement.querySelector('[name][rules]' + ':checked')
                        );
                        break;
                    default:
                        errorMessage = rules[i](event.target.value);
                }
            }

            //if program run has errorMessage, it will display out interface
            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');

                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');

                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }

            }
            return !errorMessage;

        }

        console.log(formRules);
    }

    // CLear message error function
    function handleClearError(event) {
        var formGroup = getParent(event.target, '.form-group');

        if (formGroup.classList.contains('invalid')) {
            formGroup.classList.remove('invalid');
            var formMessage = formGroup.querySelector('.form-message');

            if (formMessage) {
                formMessage.innerText = '';
            }
        }
    }



    // handle submit
    formElement.onsubmit = function (event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;

        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;

            }
        }
        console.log(isValid);

        //when it isn't error, it was be submit form
        if (isValid) {

            if (typeof _this.onSubmit === 'function') {
                //lay ra tat ca input o trang thai enable
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                   
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name +'"]:checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')) return values 
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.name)
                            break;
                        case 'file':
                            values[input.name] = input.files
                            break;
                        default:
                            values[input.name] = input.value;   
                    }
                    return values;
                }, {});

                _this.onSubmit(formValues);
            } 
            // submit case with default behavior
            else {
                formElement.submit();
            }

        }
    }
}