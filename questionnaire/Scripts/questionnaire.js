


"use strict";






var Panels, QryStrUtils, AncUtils;


$(document).bind("pageinit", function() {
    var questionnaire = new Questionnaire();
    questionnaire.init();
});

var Questionnaire = function () {

    this.is_keyboard = false;
    this.is_landscape = false;
    this.initial_screen_size = window.innerHeight;

    this.selectedcategory = '';
    this.testcategories = [];
    this.questionset = [];
    this.answerset = [];

    // used for multi answer questions
    this.currentQuestionState = [];



    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();
    this.currentQuestionIdx = 0;
    this.score = 0;


    if (this.testcategories === '1') {

        //whatever
    }


};



Questionnaire.prototype = {


    writelog: function (message) {
      //  $('#debug').append(message+'.');
    },

    getColumns: function (row) {
        
        var cols = [];

        var tpSplit = row.split(',');

        $.each(tpSplit, function () {
            if ($.trim(this) != '') cols.push(String(this));
        });

        return cols;
    },

    init: function () {

        var that = this;



        //        $('#answer-box').on('focus click tap vclick', function (event) {
        //            event.stopImmediatePropagation();
        //            event.preventDefault();

        //            $('#answer-box').blur();
        //        });


        

        var finished = function (result) {
            var rows = result.split('\x0A');
            var idx = 1;
            while (idx < rows.length) {
                
                var cols = this.getColumns(rows[idx]);

                this.testcategories.push(cols[0]);
                idx++;
            }
 

           

            try {
                var uniqueNames = [];

 

                $.each(this.testcategories, function (i, el) {
                    
           
                    if ($.inArray(el, uniqueNames) === -1)
                        uniqueNames.push(el);
                    
                    
                });

                this.testcategories = uniqueNames;                
            } catch(e) {
                
            } 

           
            if (this.testcategories.length > 0 && this.testcategories[0] !== undefined) {
          
                this.processSelect(this.testcategories[0]);
           
              //  this.createquestionset();
                
            } else {
                
            }
            
            
        };

        var aburl = 'questionnaire/Questions/questions.csv';

        $.ajax({
            url: aburl,
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });

        $('#main').bind("vclick", $.proxy(function () { this.switchtab(0); }, this));

        $('#select').bind("vclick", $.proxy(function () { this.switchtab(1); }, this));

        $('#next').bind("vclick",
        $.proxy(
        function () {
            this.displayQuestion(1);
        }, this));

        $('#prev').bind("vclick",
        $.proxy(
        function () {
            this.displayQuestion(-1);
        }, this));

        $('#submit').bind("vclick",
        $.proxy(
        function () {
            this.answerQuestion();
        }, this));

        $("#answer-box").keypress(function (event) {
            if (event.which == 13) {
                that.answerQuestion();
                $('#mainbody').css('position', '');
                $('#mainbody').css('bottom', '');

            }

        });

        $('#show-answer').bind("vclick",
            $.proxy(
            function () {
                this.toggleAnswer();
            }, this));

 





    },



    toggleAnswer: function () {


        if ($('#correct-answer').html() != '') {
            $('#correct-answer').html('');

        } else {
            var answers = this.questionset[this.currentQuestionIdx].answer;
            var correctAnswer = '';

            var idx = 0;
            if (this.questionset[this.currentQuestionIdx].type != 0) {
                while (idx < answers.length) {

                    correctAnswer += answers[idx] + ' ';
                    idx++;
                }
            } else {
                correctAnswer = this.questionset[this.currentQuestionIdx].answer;
            }

            $('#correct-answer').html(correctAnswer);
        }



    },

    switchtab: function (tabidx) {

       
        var panels = new Panels();

        if (tabidx == 0) {
         
            panels.masterShowTab(1);
          
            $("#answer-block").removeClass("hidePanel").addClass("displayPanel");

            this.createquestionset();
       
        } else {

        
            panels.masterShowTab(2);
         
            $("#answer-block").removeClass("displayPanel").addClass("hidePanel");
            this.listtests();

        }
    },

    listtests: function () {
    
        
        var cats = '';
        var selectEvents = [];
        var idx = 0;
        while (idx < this.testcategories.length) {
            if (this.testcategories[idx] !== undefined) {
                cats += '<a id= "s' + idx + '" href="index.html" data-role="button" data-theme="b" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-up-b"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">' + this.testcategories[idx] + '</span></span></a>';

                selectEvents.push({ key: 's' + idx, value: this.testcategories[idx] });
            }
            idx++;
        }
        this.ancUtils.addlinks(selectEvents, this.processSelect, this);
        $('#categories').html(cats);
    },

    answerQuestion: function () {
        var answer = $('#answer-box').val();

        //get question type
        var type = this.questionset[this.currentQuestionIdx].type;

        switch (type) {
            case 0: // standard question
                this.getScoreBasic(answer);
                break;
            case 1: // select single answer from possible answers      
                this.getScoreBasic($("input[name*=radio-choice]:checked").val());
                break;
            case 2: // image question

                break;
            case 3: // multiple answers
                this.getScoreMultiAnswer(answer);
                break;
            case 4: // multiple answers
                this.getScoreOrderedMultiAnswer(answer);
                break;

        }

        //perc-correct
        $('#perc-correct').html(this.score);

    },

    getScoreBasic: function (answer) {
        // record our answer



        this.answerset[this.currentQuestionIdx] = answer;

        //recalculate score
        var idx = 0;
        this.score = 0;
        while (idx < this.answerset.length) {

            var tpAnswer = '';
            var tpQuestion = '';

            if ($.isArray(this.questionset[idx].answer)) {
                tpAnswer = this.questionset[idx].answer[0];
            } else {
                tpAnswer = this.questionset[idx].answer;
            }

         //   tpAnswer = $.trim(String(tpAnswer));

         //   tpQuestion = $.trim(String(this.answerset[idx]));

            if (this.performMatch(tpAnswer, this.answerset[idx])) {
                this.score++;
            }
            idx++;
        }

        // express as percentage
        this.score = Math.floor(((100 / this.answerset.length) * this.score)) + '%';
    },

    performMatch: function (answer, solution) {

        answer = String(answer).toLowerCase();;
        solution = String(solution).toLowerCase();;




        if ($.trim(answer) == $.trim(solution)) {
            return true;
        } else {
            return false;
        }
    },

    getScoreMultiAnswer: function (answer) {

        // get all answers
        // make list of remaining questions that havent been answered correctly
        // make list of answers that are right
        var content = this.questionset[this.currentQuestionIdx].question;
        var remainingAnswers = [];
        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;
        var idx = 0;

        while (idx < answers.length) {
        
            if (this.performMatch(answers[idx],answer)) {
                this.currentQuestionState.push(answer);
            } else {
                remainingAnswers.push(answers[idx]);
            }
            idx++;
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

        var answersofar ='<\BR>' + 'Progress so far: '+ '<\BR>' + this.questionset[this.currentQuestionIdx].answer.length + '<\BR>';

        idx = 0;
        while (idx < this.currentQuestionState.length) {

            answersofar += this.currentQuestionState[idx] + ' ';

            idx++;
        }

        this.score = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length)) + '%';
        $('#answer-box').val('');
        $('#mainbody').html(content);
        $('#answer-so-far').html(answersofar);
    },

    getScoreOrderedMultiAnswer: function (answer) {

        // get all answers
        // make list of remaining questions that havent been answered correctly
        // make list of answers that are right
        var content = this.questionset[this.currentQuestionIdx].question;

        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;
        var idx = 0;
        var remainingAnswers = answers;


      //  if ($.trim(answers[0]) == $.trim(answer)) {
        if (this.performMatch(answers[0],answer)) {
            this.currentQuestionState.push(answer);
            remainingAnswers.splice(0, 1);
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

        var answersofar = '<\BR>' + 'Progress so far: ' + '<\BR>' + this.questionset[this.currentQuestionIdx].answer.length + '<\BR>';

        idx = 0;
        while (idx < this.currentQuestionState.length) {

            answersofar += this.currentQuestionState[idx] + ' ';

            idx++;
        }

        this.score = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length)) + '%';
        $('#answer-box').val('');
        $('#mainbody').html(content);
        $('#answer-so-far').html(answersofar);
    },

    processSelect: function (cat) {
       
        this.selectedcategory = cat;
        this.switchtab(0);
        $('#title').html(cat);


    },

    createquestionset: function () {
        //0 standard type
        //
        this.writelog('cqs');
        
        $('#mainbody').html('');
        $('#perc-correct').html('');
        $('#answer-so-far').html('');
        var finished = function (result) {
            //     var headersection = '';
            var rows = result.split('\x0A');
            var idx = 1;
            this.questionset = [];
            this.answerset = [];
            
            try {
                

            while (idx < rows.length) {
               
              //  this.writelog(idx);
                
                var cols = this.getColumns(rows[idx]);
                                         
                if (cols[0] == this.selectedcategory) {

                    var questionType = 0; // default option

                    // questions with multiple answers
                    if (cols.length > 3) {

                        var colIdx = 2;
                        var answer = []; // this can get over written
                        var constAnswers = []; // to use a permanent answer collection

                        while (colIdx < cols.length) {
                            answer.push(cols[colIdx]);
                            constAnswers.push(cols[colIdx]);
                            colIdx++;
                        }

                        if (colIdx > 2) {                                                      
                            switch ($.trim(answer[0])) {
                                case 'MA':
                                    questionType = 3; // multi answer
                                    break;
                                case 'MS':
                                    questionType = 4; // multi ordered answer
                                    break;
                                default:
                                    questionType = 1; //question is multiple choice
                                    break;
                            }
                        }

                        // questiontype is multiple choice
                        if (questionType != 1) {
                            answer.splice(0, 1);
                            constAnswers.splice(0, 1);
                        }
                        else {
                            this.answerset.push('');

                        }


                        this.questionset.push({ question: cols[1], answer: answer, type: questionType, constAnswers: constAnswers });
                    }
                    else {

                        questionType = (cols[1].indexOf(".jpg") !== -1) ? 2 : questionType;

                        this.questionset.push({ question: cols[1], answer: cols[2], type: questionType });
                        this.answerset.push('');
                    }
                }
                
               

                idx++;
                }
                
            this.displayQuestion(0);



            } catch (e) {
                $('#debug').html('exc' + e);
            }


        };

        $.ajax({
            url: 'questionnaire/Questions/questions.csv',
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });
    },




    displayQuestion: function (pos) {
        var content = '';
        this.currentQuestionState = [];
        // if (this.currentQuestionIdx == 0 && pos == -1 ) pos = 0;

        this.writelog('dq'+pos);

        switch (pos) {
            case 1:
                if (this.questionset.length - 1 > this.currentQuestionIdx)
                    this.currentQuestionIdx++;
                break;
            case -1:
                if (this.currentQuestionIdx > 0)
                    this.currentQuestionIdx--;
                break;
            default:
                this.currentQuestionIdx = 0;
        }




        if (this.questionset !== undefined && this.questionset.length > 0) {
            var items = this.questionset[this.currentQuestionIdx].answer;
            var type = this.questionset[this.currentQuestionIdx].type;

            //$('#mainbody').html(content);

            switch (type) {
                case 0:
                    $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
                    content = this.questionset[this.currentQuestionIdx].question;
                    $("#answer").removeClass("hidePanel").addClass("displayPanel");

                    $('#answer-box').val(this.answerset[this.currentQuestionIdx]);
                    break;
                case 1:
                    $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
                    $("#answer").removeClass("displayPanel").addClass("hidePanel");

                    //need to check if we have an answer saved for this question 
                    //which should be stored in the form of an index
                    //we can do a simple comparison against that.
                    var idx = 2;
                    content = '<div id="rqs"><fieldset id = "t1" data-role="controlgroup"><legend>' + this.questionset[this.currentQuestionIdx].question + '</legend>';
                    while (idx <= items.length) {
                        var chkid = 'radio-choice-' + idx;
                        if (idx == parseInt(this.answerset[this.currentQuestionIdx]) + 1)
                            content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" checked="checked" /><label for="' + chkid + '">' + items[idx - 1] + '</label>';
                        else
                            content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" /><label for="' + chkid + '">' + items[idx - 1] + '</label>';
                        idx++;
                    }
                    content += '</fieldset></div>';

                    break;
                case 2:
                    $('#answer-box').val(this.answerset[this.currentQuestionIdx]);
                    $("#imgPanel").removeClass("hidePanel").addClass("displayPanel");
                    $("#sourceid").attr("src", this.questionset[this.currentQuestionIdx].question);
                    break;

                case 3:
                    content = this.questionset[this.currentQuestionIdx].question + '<\BR>' + '';
                    $("#answer").removeClass("hidePanel").addClass("displayPanel");

                    $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");

                    break;
                case 4:
                    content = this.questionset[this.currentQuestionIdx].question + '<\BR>' + '';
                    $("#answer").removeClass("hidePanel").addClass("displayPanel");

                    $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");

                    break;


            }

            $('#current-question').html(this.currentQuestionIdx + 1 + ' of ' + this.questionset.length);
        }
        else {
            content = 'no questions';
            $("#answer").removeClass("displayPanel").addClass("hidePanel");
        }






        $('#mainbody').html(content);
        //how long did it take to work out i needed to call this - on a containing div not the content!!
        $("#rqs").trigger('create');

    }


}









            //<fieldset data-role="controlgroup">
            //	<legend>Choose a pet:</legend>
            //     	<input type="radio" name="radio-choice" id="radio-choice-1" value="choice-1" checked="checked" />
            //     	<label for="radio-choice-1">Cat</label>

            //     	<input type="radio" name="radio-choice" id="radio-choice-2" value="choice-2"  />
            //     	<label for="radio-choice-2">Dog</label>

            //     	<input type="radio" name="radio-choice" id="radio-choice-3" value="choice-3"  />
            //     	<label for="radio-choice-3">Hamster</label>

            //     	<input type="radio" name="radio-choice" id="radio-choice-4" value="choice-4"  />
            //     	<label for="radio-choice-4">Lizard</label>
            //</fieldset>
