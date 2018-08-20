// wrap in object to avoid polluting the javascript namespace
var Watu={};
var preview_state="";

Watu.current_question = 1;
Watu.total_questions = 0;
Watu.mode = "show";

Watu.isAnswered = function() {
	if(jQuery('#questionType' + Watu.current_question).val() == 'textarea') {
		if(jQuery('.watu-textarea-'+Watu.current_question).val()!='') return true;
		else return false;
	}
	
	var answered = false;
	
	jQuery("#question-" + Watu.current_question + " .answer").each(function(i) {
			if(this.checked) {
				answered = true;
				return true;
			}
	});
	
	return answered;	
}

Watu.isRequired = function() {
	if(jQuery('#questionType'+ Watu.current_question).attr('class') == 'required') return true;
	
	return false;
}

Watu.checkAnswer = function(e) {

	console.log("answer checked!");
	if(!Watu.isAnswered()) {
		if(Watu.isRequired()) {
			alert(watu_i18n.missed_required_question);
			return false;
		}
		
		// not required, so ask
		if(!Watu.noAlertUnanswered && !confirm(watu_i18n.nothing_selected)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
	return true;
}

Watu.nextQuestion = function(e, dir) {
	dir = dir || 'next'; // next or previous
	if(dir == 'next' && !Watu.checkAnswer(e)) return;

	// change the displayed question number
	var numQ = jQuery('#numQ').html();
	if(dir == 'next') numQ++;
	else numQ--;	
	jQuery('#numQ').html(numQ);

	jQuery("#question-" + Watu.current_question).hide();
	if(dir == 'next') Watu.current_question++;
	else Watu.current_question--;
	jQuery("#question-" + Watu.current_question).show();
	
	if(Watu.total_questions <= Watu.current_question) {
		jQuery("#next-question").hide();
		jQuery("#action-button").show();
		if(jQuery('#WatuTextCaptcha').length) jQuery('#WatuTextCaptcha').show();
	}
	else {
		jQuery("#next-question").show();
		if(jQuery('#WatuTextCaptcha').length) jQuery('#WatuTextCaptcha').hide();
	}

	// show / hide prev button if any
	if(jQuery('#prev-question').length) {
		if(Watu.current_question <= 1) jQuery('#prev-question').hide();
		else jQuery('#prev-question').show();
	}
	
	if(jQuery(document).scrollTop() > 250) {	
		jQuery('html, body').animate({
	   		scrollTop: jQuery('#watu_quiz').offset().top -100
	   }, 100);   
	}   

}

jQuery(".answer-btn").on('click',function(e){
    var aid=jQuery(this).data("aid");
    jQuery("#answer-id-"+aid).click();   
    if(Watu.current_question<Watu.total_questions)
    Watu.nextQuestion();
    else Watu.submitResult();  

    var next_el=jQuery( ".qu_point.current_q" ).toggleClass( 'current_q complete_q').next();  
    if(jQuery(next_el).hasClass('complete_q')){ 
    	preview_state=next_el;
    	jQuery(next_el).removeClass("complete_q");
   } 
   jQuery(next_el).addClass('current_q'); 
    
});

// This part is used only if the answers are show on a per question basis.
Watu.showAnswer = function(e) {
	if(!Watu.checkAnswer(e)) return;

	if(Watu.mode == "next") {
		Watu.mode = "show";

		jQuery("#question-" + Watu.current_question).hide();
		Watu.current_question++;
		jQuery("#question-" + Watu.current_question).show();

		jQuery("#show-answer").val(watu_i18n.show_answer);
		
		if(jQuery(document).scrollTop() > 250) {	
			jQuery('html, body').animate({
		   		scrollTop: jQuery('#watu_quiz').offset().top -100
		   }, 100);   
		}   
		return;
	}

	Watu.mode = "next";

	jQuery(".php-answer-label.label-"+Watu.current_question).addClass("correct-answer");
	jQuery(".answer-"+Watu.current_question).each(function(i) {
		if(this.checked && this.className.match(/wrong\-answer/)) {
			var number = this.id.toString().replace(/\D/g,"");
			if(number) {
				jQuery("#answer-label-"+number).addClass("user-answer");
			}
		}
	});
	
	if(jQuery('#watuQuestionFeedback-' + Watu.current_question).length) {
		jQuery('#watuQuestionFeedback-' + Watu.current_question).show();
	}

	if(Watu.total_questions <= Watu.current_question) {
		jQuery("#show-answer").hide();
		jQuery("#action-button").show();
	} else {
		jQuery("#show-answer").val("Next >");
	}
	
	if(jQuery(document).scrollTop() > 250) {	
		jQuery('html, body').animate({
	   		scrollTop: jQuery('#watu_quiz').offset().top -100
	   }, 100);   
	}   
}

Watu.submitResult = function(e) {
	var answer_ids = [];
	jQuery('#quiz-' + this.exam_id + ' .watu-answer-ids').each(function(index, value){
		answer_ids.push(this.value);
	});
	
	// if text captcha is there we have to make sure it's shown
	if(jQuery('#WatuTextCaptcha').length && !jQuery('#WatuTextCaptcha').is(':visible')) {
		alert(watu_i18n.complete_text_captcha);
		jQuery('#WatuTextCaptcha').show();
		return false;
	}
 
	var data = {action:'watu_submit', 'do': 'show_exam_result', quiz_id: exam_id, 
	'question_id[]': Watu.qArr, 'answer_ids[]' : answer_ids };
	
	if(jQuery('#watuTakerEmail').length) {
		var emailVal = jQuery('#watuTakerEmail').val();
		if(emailVal == '' || emailVal.indexOf('@') < 0 || emailVal.indexOf('.') < 1) {
			alert(watu_i18n.email_required);
			jQuery('#watuTakerEmail').focus();
			return false;
		} 
		data['watu_taker_email'] = emailVal;
	}
	
	for(x=0; x<Watu.qArr.length; x++) {
		if(Watu.singlePage) {
			 Watu.current_question = x+1;
			 
			 if(!Watu.isAnswered() && Watu.isRequired()) {
			 		alert(watu_i18n.missed_required_question);
			 		return false;
			 }
		}		
		
    // qArr[x] is the question ID
		var ansgroup = '.answerof-'+Watu.qArr[x];
		var fieldName = 'answer-'+Watu.qArr[x];
		var ansvalues= Array();
		var i=0;
        
	    if(jQuery('#textarea_q_'+Watu.qArr[x]).length>0) {
	        // open end question
	        ansvalues[0]=jQuery('#textarea_q_'+Watu.qArr[x]).val();
	    } 
	    else {
	        jQuery(ansgroup).each(function(){
						if( jQuery(this).is(':checked') ) {
							ansvalues[i] = this.value;
							i++;
	  			}
	  		});    
	    }
		
		data[fieldName+'[]'] = ansvalues;
	}
	
	data['post_id'] = Watu.post_id;
	data['start_time'] = jQuery('#watuStartTime').val();
	data['h_app_id'] = Watu.hAppID; 
	
	// no ajax? In this case only return true to allow submitting the form	
	if(e && e.no_ajax && e.no_ajax.value == 1) return true;	
	
	// if question captcha is available, add to data
	if(jQuery('#WatuTextCaptcha').length>0) {
		jQuery('#quiz-'+Watu.exam_id).show();
		data['watu_text_captcha_answer'] = jQuery('#quiz-' + Watu.exam_id + ' input[name=watu_text_captcha_answer]').val();
		data['watu_text_captcha_question'] = jQuery('#quiz-' + Watu.exam_id + ' input[name=watu_text_captcha_question]').val();
	}
	
	// honeypot? show back form  to wait for verification
	if(jQuery('#watuAppID' + Watu.exam_id).length > 0) {		
		jQuery('#quiz-'+Watu.exam_id).show();
	}
	
	jQuery('html, body').animate({
   		scrollTop: jQuery('#watu_quiz').offset().top - 50
   	}, 1000); 
	
	//jQuery('#watu_quiz').html("<p>Loading...</p>");
    
	//var v=''; for(a in data) v+=data[a]+'\n'; alert(v);
	// don't do ajax call if no_ajax
	if(!e || !e.no_ajax || e.no_ajax.value != 1) {
		try{
			jQuery.ajax({ type: 'POST', url: watuURL, data: data, success: Watu.success, error: Watu.error  });
		} catch(e) { alert(e) }
	}
}

Watu.takingDetails = function(id, adminURL) {
	adminURL = adminURL || "";
	tb_show("Taking Details", adminURL + "admin-ajax.php?action=watu_taking_details&id="+id, adminURL + "admin-ajax.php");
}

Watu.success = function(r){
	// first check for recaptcha error, if yes, do not replace the HTML
	 // but display the error in alert and return false;
	 if(r.indexOf('WATU_CAPTCHA:::')>-1) {
	 		parts = r.split(":::");
	 		alert(parts[1]);
	 		jQuery("#action-button").val(watu_i18n.try_again);
			jQuery("#action-button").removeAttr("disabled");
	 		return false;
	 } 

	 // redirect?
	 if(r.indexOf('WATU_REDIRECT:::') > -1) {
	 		parts = r.split(":::");
	 		window.location = parts[1];
	 		return true;
	 }	 

	jQuery('#watu_quiz').html(r);
}
Watu.error = function(){ jQuery('#watu_quiz').html('Error Occured');}

Watu.initWatu = function() {
	jQuery("#question-1").show();
	Watu.total_questions = jQuery(".watu-question").length;

	if(Watu.total_questions == 1) {
		jQuery("#action-button").show();
		jQuery("#next-question").hide();
		jQuery("#show-answer").hide();

	} else {
		jQuery("#next-question").click(Watu.nextQuestion);
		jQuery("#show-answer").click(Watu.showAnswer);
	}
	if(!Watu.singlePage) jQuery("#action-button").click(Watu.nextQuestion);
	
	// give the honey if any
	quizID = Watu.exam_id;
	if(jQuery('#watuAppID' + quizID).length > 0) {
		Watu.hAppID = '_' + jQuery('#watuAppSourceID' + quizID).val();
		jQuery('#watuAppID' + quizID).val(Watu.hAppID);
	}		
}

jQuery(document).ready(Watu.initWatu);

function doProgress(current, total,element)
{

  var progress=	100/(total/current);
  jQuery(element).animate({width: progress+"%"}, 500);

}




jQuery("li.qu_point").on('click',function(e){


	if(jQuery(this).hasClass('complete_q')){
        jQuery(preview_state).addClass("complete_q");
		var question_number=jQuery(this).find(".qu_tooltip").data('id');
		jQuery('#numQ').html(question_number);
        preview_state=this;  
		jQuery( ".qu_point.current_q" ).removeClass( 'current_q');  
		jQuery(this).toggleClass("complete_q current_q");				

		jQuery("#question-" + Watu.current_question).hide();
		Watu.current_question=question_number;
		jQuery("#question-" + Watu.current_question).show();		

	}
  
});

jQuery('body').on('click', '.show-question', function() {
    // do something
      jQuery(this).find(".question-desc").toggle();
});

