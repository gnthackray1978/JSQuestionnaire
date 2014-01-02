


"use strict";


var QView = function () {
    
    this.ancUtils = new AncUtils();
    
};


QView.prototype = {
    DisplayScore: function(questionScore, overallScore) {        
        $('#question-score').html(questionScore + '%');
        
        if(overallScore!= undefined)
            $('#perc-correct').html(overallScore + '%');
    },
    GetAnswer:function() {
        return $('#answer-box').val();
    },
    DisplayCorrectAnswer: function(answer) {
        $('#correct-answer').html(answer);
    },
    switchtab: function (tabidx,tab1) {


        var panels = new Panels();

        if (tabidx == 0) {

            panels.masterShowTab(1);

            $("#answer-block").removeClass("hidePanel").addClass("displayPanel");

            tab1();
            
            

        } else {


            panels.masterShowTab(2);

            $("#answer-block").removeClass("displayPanel").addClass("hidePanel");
            
            tab1();
         //   this.listtests();

        }
    },
    createCatList: function (catList, processSelectFunc, context) {
        
        var cats = '';
        var selectEvents = [];
        var idx = 0;
        while (idx < catList.length) {
            if (catList[idx] !== undefined) {
                cats += '<a id= "s' + idx + '" href="index.html" data-role="button" data-theme="b" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-up-b"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">' + catList[idx] + '</span></span></a>';

                selectEvents.push({ key: 's' + idx, value: catList[idx] });
            }
            idx++;
        }
        this.ancUtils.addlinks(selectEvents, processSelectFunc, context);
        
        $('#categories').html(cats);
    },
    updateBoxs: function (currentQuestionState, answer, content,answerBox) {
        

        // answer = this.questionset[this.currentQuestionIdx].answer.length


        //this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));

        //currentQuestionState

        var answersofar = '<\BR>' + 'Progress so far: ' + '<\BR>' + answer.length + '<\BR>';

        var idx = 0;
        while (idx < currentQuestionState.length) {

            answersofar += currentQuestionState[idx] + ' ';

            idx++;
        }
      



        $('#answer-box').val(answerBox);

        $('#mainbody').html(content);//question box
        

        $('#answer-so-far').html(answersofar);
    },
    displayStandardQuestion: function (question, answer) {
        
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
         
        $("#answer").removeClass("hidePanel").addClass("displayPanel");

        $('#answer-box').val(answer);
        
        $('#mainbody').html(question);
    },    
    displayMultipleChoice: function (question, constAnswers, selectionIdx) {
        
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
        $("#answer").removeClass("displayPanel").addClass("hidePanel");

        //need to check if we have an answer saved for this question 
        //which should be stored in the form of an index
        //we can do a simple comparison against that.
        var idx = 2;
        var content = '<div id="rqs"><fieldset id = "t1" data-role="controlgroup"><legend>' + question + '</legend>';
        while (idx <= constAnswers.length) {
            var chkid = 'radio-choice-' + idx;
            if (idx == selectionIdx)
                content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" checked="checked" /><label for="' + chkid + '">' + constAnswers[idx - 1] + '</label>';
            else
                content += '<input type="radio" name="radio-choice" id="' + chkid + '" value="' + (idx - 1) + '" /><label for="' + chkid + '">' + constAnswers[idx - 1] + '</label>';
            idx++;
        }
        content += '</fieldset></div>';
        
        $('#mainbody').html(content);
    },
    displayImageQuestion: function (question, answerSet) {
        
        $('#answer-box').val(answerSet);
        $("#imgPanel").removeClass("hidePanel").addClass("displayPanel");
        $("#sourceid").attr("src", question);
        //multi answer   
    },
    displayMultiAnswerQuestion: function (question) {             
        $("#answer").removeClass("hidePanel").addClass("displayPanel");
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");        
        $('#mainbody').html(question);        
        //multi answer   
    },
    displaySortedMultiAnswerQuestion: function (question) {        
        $("#answer").removeClass("hidePanel").addClass("displayPanel");
        $("#imgPanel").removeClass("displayPanel").addClass("hidePanel");
        $('#mainbody').html(question);
        //multi answer   
    },
    updateCurrentQuestionLabel: function(currentQuestion, totalQuestions) {
        $('#current-question').html(currentQuestion + ' of ' + totalQuestions);        
    },
    displayNoQuestion: function() {   
        $("#answer").removeClass("displayPanel").addClass("hidePanel");
        $('#mainbody').html('no questions');
    },
    updateAnswerSoFar: function(answerSoFar) {   
        $('#answer-so-far').html(answerSoFar);
    },
    setTitle: function(title) {   
        $('#title').html(title);
    },
    bindPrevQuestionEvt:function(callback, context) {
        
        $('#next').bind("vclick",
            $.proxy(
                function () {
                    callback(-1);
                }, context));
    },
    
    bindNextQuestionEvt:function(callback, context) {
        
        $('#next').bind("vclick",
            $.proxy(
                function () {
                    callback(1);
                }, context));
    }




};


var Panels, QryStrUtils, AncUtils;


$(document).bind("pageinit", function () {
    


    var questionnaire = new Questionnaire();
    


    questionnaire.init();
});




var Questionnaire = function () {

    this.view = new QView();
    
    this.is_keyboard = false;
    this.is_landscape = false;
    this.initial_screen_size = window.innerHeight;
    this.qryStrUtils = new QryStrUtils();
    this.ancUtils = new AncUtils();




    this.selectedcategory = '';
    this.testcategories = [];
    this.questionset = [];
    this.answerset = [];

    // used for multi answer questions
    this.currentQuestionState = [];


    this.isAnswerDisplayed = false;


    this.currentQuestionIdx = 0;
    this.score = 0;
    this.questionscore = 0;
    
    this.tests = [];

    this.tests.push('questionnaire/Questions/aspnet.csv');
    this.tests.push('questionnaire/Questions/c_sharp.csv');
    this.tests.push('questionnaire/Questions/javascript.csv');
    this.tests.push('questionnaire/Questions/oop.csv');
    this.tests.push('questionnaire/Questions/samples.csv');

    


};


Questionnaire.prototype = {
    writelog: function(message) {
        //  $('#debug').append(message+'.');
    },

    getColumns: function(row) {

        var cols = [];

        var tpSplit = row.split(',');

        $.each(tpSplit, function() {
            if ($.trim(this) != '') cols.push(String(this));
        });

        return cols;
    },

    getTestCategories:function(rows, catColIdx) {

      
        var tp = [];
        
        var idx = 1;
        while (idx < rows.length) {

            var cols = this.getColumns(rows[idx]);

            tp.push(cols[catColIdx]);
            idx++;
        }


        try {
            var uniqueNames = [];


            $.each(tp, function (i, el) {


                if ($.inArray(el, uniqueNames) === -1)
                    uniqueNames.push(el);


            });

            tp = uniqueNames;
        } catch (e) {

        }

        return tp;
    },


    init: function() {

        var that = this;


        //        $('#answer-box').on('focus click tap vclick', function (event) {
        //            event.stopImmediatePropagation();
        //            event.preventDefault();

        //            $('#answer-box').blur();
        //        });


        var finished = function(result) {
            
            this.testcategories = this.getTestCategories(result.split('\x0A'),0);

            if (this.testcategories.length > 0 && this.testcategories[0] !== undefined) {

                this.processSelect(this.testcategories[0]);

                //  this.createquestionset();

            }  


        };


        $.ajax({
            url: this.tests[3],
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });

        $('#main').bind("vclick", $.proxy(function () {

            var ithat = this;
            ithat.view.switchtab(0, function () {
                ithat.createquestionset();
            });
        }, this));

        $('#select').bind("vclick", $.proxy(function () {
            var ithat = this;
            ithat.view.switchtab(1, function () {
                ithat.listtests();
            });
        }, this));

        //$('#next').bind("vclick",
        //    $.proxy(
        //        function() {
        //            this.displayQuestion(1);
        //        }, this));

        //$('#prev').bind("vclick",
        //    $.proxy(
        //        function() {
        //            this.displayQuestion(-1);
        //        }, this));




        $('#submit').bind("vclick",
            $.proxy(
                function() {
                    this.answerQuestion();
                }, this));

        $("#answer-box").keypress(function(event) {
            if (event.which == 13) {
                that.answerQuestion();
                $('#mainbody').css('position', '');
                $('#mainbody').css('bottom', '');

            }

        });

        $('#show-answer').bind("vclick",
            $.proxy(
                function() {
                    this.toggleAnswer();
                }, this));


    },



    toggleAnswer: function() {


        if (this.isAnswerDisplayed == true) {           
            this.view.DisplayCorrectAnswer('');
            this.isAnswerDisplayed = false;

        } else {
            var answers = this.questionset[this.currentQuestionIdx].answer;
            var correctAnswer = '';

            var idx = 0;
            if (this.questionset[this.currentQuestionIdx].type != 0) {
                while (idx < answers.length) {

                    correctAnswer += answers[idx];

                    if (idx < answers.length - 1)
                        correctAnswer += ',';
                    idx++;
                }
            } else {
                correctAnswer = this.questionset[this.currentQuestionIdx].constAnswers;
            }
             
            this.view.DisplayCorrectAnswer(correctAnswer);
            
            this.isAnswerDisplayed = true;
        }


    },

    listtests: function() {
        this.view.createCatList(this.testcategories, this.processSelect, this);
    },

    answerQuestion: function() {

        var answer = this.view.GetAnswer();

        //get question type
        var type = this.questionset[this.currentQuestionIdx].type;

        switch (type) {
        case 0:
// standard question
            this.getScoreBasic(answer);
            break;
        case 1:
// select single answer from possible answers      
            this.getScoreBasic($("input[name*=radio-choice]:checked").val());
            break;
        case 2:
// image question

            break;
        case 3:
// multiple answers
            this.getScoreMultiAnswer(answer);
            break;
        case 4:
// multiple answers
            this.getScoreOrderedMultiAnswer(answer);
            break;
        }

        this.questionset[this.currentQuestionIdx].score = this.questionscore;


        var idx = 0;
        var working = 0;
        while (idx < this.questionset.length) {
            working += this.questionset[idx].score;
            idx++;
        }


        this.score = Math.floor(((100 / (this.questionset.length * 100)) * working));

        this.view.DisplayScore(this.questionscore, this.score);


    },

    getScoreBasic: function(answer) {
        // record our answer


        this.answerset[this.currentQuestionIdx] = answer;

        //recalculate score
        var idx = 0;

        this.questionscore = 0;

        while (idx < this.answerset.length) {

            var tpAnswer = '';
            var tpQuestion = '';

            if ($.isArray(this.questionset[idx].answer)) {
                tpAnswer = this.questionset[idx].answer[0];
            } else {
                tpAnswer = this.questionset[idx].answer;
            }

            if (this.performMatch(tpAnswer, this.answerset[idx])) {
                this.questionscore++;
            }
            idx++;
        }


        this.questionscore = Math.floor(((100 / this.answerset.length) * this.questionscore));


    },

    performMatch: function(answer, solution) {

        answer = String(answer).toLowerCase();
        ;
        solution = String(solution).toLowerCase();
        ;


        if ($.trim(answer) == $.trim(solution)) {
            return true;
        } else {
            return false;
        }
    },




    getScoreMultiAnswer: function(answer) {

        // get all answers
        // make list of remaining questions that havent been answered correctly
        // make list of answers that are right
      //  var content = this.questionset[this.currentQuestionIdx].question;
        var remainingAnswers = [];
        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;
        var idx = 0;

        while (idx < answers.length) {

            if (this.performMatch(answers[idx], answer)) {
                this.currentQuestionState.push(answer);
            } else {
                remainingAnswers.push(answers[idx]);
            }
            idx++;
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

        this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));

        this.view.updateBoxs(this.currentQuestionState, this.questionset[this.currentQuestionIdx].answer, this.questionset[this.currentQuestionIdx].question,'');
    },

    getScoreOrderedMultiAnswer: function(answer) {

        // get all answers
        // make list of remaining questions that havent been answered correctly
        // make list of answers that are right
      //  var content = this.questionset[this.currentQuestionIdx].question;

        var answers = this.questionset[this.currentQuestionIdx].answer;
        var originalAnswers = this.questionset[this.currentQuestionIdx].constAnswers;
     //   var idx = 0;
        var remainingAnswers = answers;


        //  if ($.trim(answers[0]) == $.trim(answer)) {
        if (this.performMatch(answers[0], answer)) {
            this.currentQuestionState.push(answer);
            remainingAnswers.splice(0, 1);
        }

        this.questionset[this.currentQuestionIdx].answer = remainingAnswers;

      //  var answersofar = '<\BR>' + 'Progress so far: ' + '<\BR>' + this.questionset[this.currentQuestionIdx].answer.length + '<\BR>';

     //   idx = 0;
      //  while (idx < this.currentQuestionState.length) {

     //       answersofar += this.currentQuestionState[idx] + ' ';

      //      idx++;
      //  }

        this.questionscore = Math.floor(((100 / originalAnswers.length) * this.currentQuestionState.length));


    //    $('#answer-box').val('');
    //    $('#mainbody').html(content);
     //   $('#answer-so-far').html(answersofar);
        

        this.view.updateBoxs(this.currentQuestionState, this.questionset[this.currentQuestionIdx].answer, this.questionset[this.currentQuestionIdx].question, '');
    },

    processSelect: function(cat) {

        var ithat = this;

        ithat.selectedcategory = cat;

        ithat.view.switchtab(0, function () {
            ithat.createquestionset();
        });
                 
        ithat.view.setTitle(cat);
    },

    createquestionset: function() {
        //0 standard type
        //
        this.writelog('cqs');

        $('#mainbody').html('');
        $('#perc-correct').html('');
        $('#question-score').html('');
        $('#answer-so-far').html('');



        var finished = function(result) {
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
                            } else {
                                this.answerset.push('');

                            }


                            this.questionset.push({ question: cols[1], answer: answer, type: questionType, constAnswers: constAnswers, score: 0 });
                        } else {

                            questionType = (cols[1].indexOf(".jpg") !== -1) ? 2 : questionType;

                            this.questionset.push({ question: cols[1], answer: cols[2], type: questionType, constAnswers: cols[2], score: 0 });
                            this.answerset.push('');
                        }
                    }


                    idx++;
                }

                this.displayQuestion(0);


            } catch(e) {
                $('#debug').html('exc' + e);
            }


        };


        $.ajax({
            url: this.tests[3],
            data: "query=search_terms",
            success: $.proxy(finished, this)
        });
    },

    displayQuestion: function(pos) {
   
        this.currentQuestionState = [];
        
        this.writelog('dq' + pos);

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

      //  $('#answer-so-far').html('');

        //updateAnswerSoFar
        this.view.updateAnswerSoFar('');

        if (this.questionset !== undefined && this.questionset.length > 0) {
            var type = this.questionset[this.currentQuestionIdx].type;

            this.questionset[this.currentQuestionIdx].answer = this.questionset[this.currentQuestionIdx].constAnswers;

            this.view.DisplayScore('0');
            
            this.questionscore = 0;

            switch (type) {
            case 0:                
                this.view.displayStandardQuestion(this.questionset[this.currentQuestionIdx].question,this.answerset[this.currentQuestionIdx]);
                break;
            case 1:               
                this.view.displayMultipleChoice(this.questionset[this.currentQuestionIdx].question, this.questionset[this.currentQuestionIdx].constAnswers, parseInt(this.answerset[this.currentQuestionIdx]) + 1);
                break;
            case 2:               
                this.view.displayImageQuestion(this.questionset[this.currentQuestionIdx].question, this.answerset[this.currentQuestionIdx]);                
                break;
            case 3:// multi answer
                this.view.displayMultiAnswerQuestion(this.questionset[this.currentQuestionIdx].question);
                break;
            case 4:// multi ordered answer
                this.view.displayMultiAnswerQuestion(this.questionset[this.currentQuestionIdx].question);
                break;
            }
            this.view.updateCurrentQuestionLabel(this.currentQuestionIdx + 1, this.questionset.length);
            
        } else {
            this.view.displayNoQuestion();
        }


      //  $('#mainbody').html(content);
        //how long did it take to work out i needed to call this - on a containing div not the content!!
        $("#rqs").trigger('create');

    }
};









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
