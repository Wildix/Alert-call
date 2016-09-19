var options = {
		host: '',
		login: '',
		password: ''
}

/*
 * English
 */
/*var translations = {
		Name: 'Name',
		Number: 'Number',
		Start: 'Start',
		CallState: 'Call state',
		PinState: 'Pin state',
		Info: 'Info',


		//tags
		emergency_real: '',
		call_out_test: '',
		call_out_real: '',
		start: '',
		stop: '',

		no_answer: 'No answer',
		answered: 'Answered',
		confirmed: 'Confirmed',
		refused: 'Refused',
		busy: 'Busy',
		congestion: 'Not available',


		no_pin: 'No pin',
		correct_pin: 'Correct pin',
		pin_not_correct: 'Pin not correct'
}*/
/*
 * Italy
 */
var translations = {
		Name: 'Nome',
		Number: 'Numero',
		Start: 'Inizio',
		CallState: 'Stato chiamata',
		PinState: 'Stato Pin',
		Info: 'Info',


		/*
		 * tags
		 */
		emergency_real: '',
		call_out_test: '',
		call_out_real: '',
		start: '',
		stop: '',

		no_answer: 'Non risposto',
		answered: 'Risposto',
		confirmed: 'Confermato',
		refused: 'Rifiutato',
		busy: 'Occupato',
		congestion: 'Non disponibile',


		no_pin: 'No pin',
		correct_pin: 'Pin corretto',
		pin_not_correct: 'Pin non corretto'
}


var callsTags = ['no_answer', 'answered', 'confirmed', 'refused', 'busy', 'congestion'];
var pinTags = ['no_pin', 'correct_pin', 'pin_not_correct'];

$(document).ready(function() {

	$.ajaxSetup({
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		}
	});


	loadSettings();

	$('#settings-modal-host').val(options.host);
	$('#settings-modal-login').val(options.login);
	$('#settings-modal-password').val(options.password);


    $('#settings-btn').on('click', function(){
    	$("#settings-modal").modal('show');
    });


    $('#export-btn').on('click', function(){
    	exportTableToCSV.apply(this);
    });

    $('#update-button').on('click', function(){
    	startTimer();
    	loadData();
    });

    $('#call-errors-btn').on('click', function(){
    	$("#call-errors-modal").modal('show');
    });


    $('#from-date').datetimepicker({
        dateFormat: "dd/mm/yy",
        timeFormat: 'HH:mm',
        changeMonth: true,
        changeYear: true,
        showButtonPanel: false,
        onSelect: function(){
        	stopTimer()
        	$('#from-date').datetimepicker('hide');
        	$('#to-date').datetimepicker('option', 'minDate', $('#from-date').datetimepicker('getDate') );
        },
        onClose: function(dateText, inst) {
    		if ($('#to-date').val() != '') {
    			var testStartDate = $('#from-date').datetimepicker('getDate');
    			var testEndDate = $('#to-date').datetimepicker('getDate');
    			if (testStartDate > testEndDate)
    				$('#to-date').datetimepicker('setDate', testStartDate);
    		}
    		else {
    			$('#to-date').val(dateText);
    		}
    	},
    });

    $('#to-date').datetimepicker({
        dateFormat: "dd/mm/yy",
        timeFormat: 'HH:mm',
        changeMonth: true,
        changeYear: true,
        showButtonPanel: false,
        onSelect: function(){
        	stopTimer();
        	$('#to-date').datetimepicker('hide');
        	$('#from-date').datetimepicker('option', 'maxDate', $('#to-date').datetimepicker('getDate') );
        },
        onClose: function(dateText, inst) {
    		if ($('#from-date').val() != '') {
    			var testStartDate = $('#from-date').datetimepicker('getDate');
    			var testEndDate = $('#to-date').datetimepicker('getDate');
    			if (testStartDate > testEndDate)
    				$('#from-date').datetimepicker('setDate', testEndDate);
    		}
    		else {
    			$('#from-date').val(dateText);
    		}
    	},
    });

    var yesterdayDate = new Date();
    yesterdayDate.setHours(0);
    yesterdayDate.setMinutes(0);
	$("#from-date").datetimepicker("setDate", yesterdayDate);

	yesterdayDate.setHours(23);
    yesterdayDate.setMinutes(59);
	$("#to-date").datetimepicker("setDate",  yesterdayDate);


	$('#settings-modal-save-button').on('click', function(){
    	localStorage.setItem("host", $('#settings-modal-host').val());
    	localStorage.setItem("login", $('#settings-modal-login').val());
    	localStorage.setItem("password", $('#settings-modal-password').val());

    	loadSettings();

    	$("#settings-modal").modal('hide');

    	if(isFilledSettings()){
    		initialise();
    	}
    });

    $('#error-modal-ok-button').on('click', function(){
    	$('#error-modal').modal('hide');
    });
    $('#call-errors-modal-ok-button').on('click', function(){
    	$('#call-errors-modal').modal('hide');
    });

    initialise();
});

function initialise(){

	if(isFilledSettings()){
		$.ajax({
    		url: location.protocol+'//'+options.host+'/api/v1/personal/login',
    		type: 'POST',
    		data: {
    			login: options.login,
    			password: options.password
    		},
    		success:function(){
    			loadData();
    		},
    		error: function(jqXHR, textStatus, errorThrown){
    			if(jqXHR.responseText && jqXHR.responseText!=''){
    				var response = $.parseJSON(jqXHR.responseText);
    				if(response && response['type'] && response['type'] == 'error' && response['reason']){
    					showError(response['reason']);
    				}else{
    					showError("Login failed<br>Response: "+jqXHR.responseText);
    				}
    			}else{
    				showError('Login failed '+errorThrown);
    			}
    		}
    	});
	}else{
		$("#settings-modal").modal('show');
	}
}

function isFilledSettings(){
	if(options.host != '' && options.login != '' && options.password != ''){
		return true;
	}
	return false;
}
function loadSettings(){
	$.each(['host', 'login', 'password'], function(i, key){
		var val = localStorage.getItem(key);
		if(val){
			options[key] = val;
		}
	});
}

var _loadTimer = null;
function startTimer(){
	stopTimer();
	_loadTimer = setInterval(function(){
		loadData(true);
	}, 5000);
}


function stopTimer(){
	if(_loadTimer){
		clearInterval(_loadTimer);
		_loadTimer = null;
	}
}

function showError(message){
	$('#error-modal .modal-body').html(message);
	$('#error-modal').modal('show');
}

function loadData(withoutMask){

	var fromDate = $("#from-date").datetimepicker("getDate");

	if(fromDate){
		fromDate = fromDate.format('yyyy-mm-dd HH:MM');
	}
	var toDate = $("#to-date").datetimepicker("getDate");
	if(toDate){
		toDate = toDate.format('yyyy-mm-dd HH:MM');
	}


	var filter = {
			start: {
				from: fromDate,
				to: toDate
			},
			type: {
            	not: 'fax'
            }
	}
	if(!withoutMask){
		$(".body_wrapper").mask('Loading ...');
	}

	$.ajax({
		url: location.protocol+'//'+options.host+'/scripts/AlertCalls.php',
		type: 'GET',
		data: {
			filter: filter
		},
		success:function(response, textStatus, jqXHR){
			$(".body_wrapper").unmask();

			if($.isArray(response)){
				printData(response)
			}else{
				stopTimer();
				showError("Unknown format: "+jqXHR.responseText);
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			$(".body_wrapper").unmask();
			stopTimer();
			showError(errorThrown+"<br>Response: "+(jqXHR.responseText || ""));
		}
	});
}



function printData(data){

	if(data.length == 0){
		$('#content').html('No records found')
		return;
	}

	var result = {};
	var numberLink = {};
	var errors = null;

	for(var i=0; i < data.length; i++){
		var id = data[i]['from_number'];
		var name = data[i]['to_name']
		var number = data[i]['to_number']
		var tags = data[i]['lastdata'].replace(/^tags:/, '');

		var numberID = tags.match(/number(\d)/i);
		if(numberID && numberID[1]){
			numberID = numberID[1]+'-'+number;
		}

		//console.log(tags);
		tags = $.map(tags.split(","), $.trim);

		if(!result[id]){
			result[id] = {
					start: null,
					end: '',
					real: false,
					contacts: {}
			};
			numberLink[id]= {};
		}


		if(!result[id]['contacts'][name]){
			result[id]['contacts'][name] = {};
			numberLink[id][name] = [];
		}


		if(!result[id]['contacts'][name][numberID]){
			numberLink[id][name].push(numberID);
			result[id]['contacts'][name][numberID] = {
					calls: []
			}
		}

		var item = {
				id: id,
				number: number,
				name: name,
				start: new Date(data[i]['start'].replace(/-/g, "/")),
				end: new Date(data[i]['end'].replace(/-/g, "/")),
				tags:tags
		};

		if($.inArray('stop', tags) >= 0){
			result[id].end = item.end;
		}

		if($.inArray('call_out_real', tags) >= 0){
			result[id].real = true;
		}

		if(!result[id].start){
			if($.inArray('start', tags) >= 0){
				result[id].start = item.start;
			}
		}

		if($.inArray('chanunavail', tags) >= 0){

			if(!errors){
				errors = {};
			}

			if(!errors[id]){
				errors[id] = {};
			}
			if(!errors[id][name]){
				errors[id][name] = [];
			}

			errors[id][name].push(item);
			continue;
		}


		result[id]['contacts'][name][numberID]['calls'].push(item);
	}

	printErrors(errors);

	var countNumbers = 3;
	var countAttempts = 3;
	var html = '';
	$.each(result, function(id, pool){

		html += "<div class='callout'>";
		html += '<table class="table table-hover" width="100%">';
		html +='<thead>';
		html +="<tr>" +
				"<th colspan='2'>" +
					"<span class='type'>"+((pool.real)? 'Real': 'Test')+" </span>" +
					"<span class='date'>"+((pool.start)?pool.start.format('yyyy/mm/dd'): "")+"</span> " +
					"<span class='time'>"+((pool.start)?pool.start.format('HH:MM'): "")+' - '+((pool.end)?pool.end.format('HH:MM'): "")+"</span>" +
				"</th>" +
				"<th colspan='11'></th>" +
				"</tr>";


		html +="<tr>" +
				"<th>"+translations.Name+"</th>";
		for(var i=1; i < countNumbers+1; i++){
			html +="<th>"+translations.Number+" "+i+"</th>" +
				"<th>"+translations.Start+" "+i+"</th>" +
				"<th>"+translations.CallState+" "+i+"</th>" +
				"<th>"+translations.PinState+" "+i+"</th>";
		}
		html +="</tr>";
		html +='</thead>';
		html +='<tbody>';
		$.each(pool.contacts, function(name, numbers){

			for(var j=0; j < countAttempts; j++){
				html +='<tr>';
				if(j==0){ // if first line show name
					html +='<td>'+name+'</td>';
				}else{
					html +='<td></td>';
				}

				for(var i=0; i < countNumbers; i++){
					var number = numberLink[id][name][i];
					if(number){
						var calls = numbers[number].calls;

						if(j!=0){
							html +='<td></td>';
						}

						if(calls[j]){

							var pinState = getPinState(calls[j]);
							var callState = getCallState(calls[j]);
							if(!callState && pinState){
								callState = translations.answered;
							}

							if(!pinState && (callState == translations.confirmed || callState == translations.refused)){
								pinState = translations.correct_pin;
							}

							if(callState == translations.answered && !pinState){
								pinState = translations.no_pin;
							}

							if(j==0){
								// if first line show number
								html +='<td>'+calls[j].number+'</td>';
							}
							html +='<td>'+calls[j].start.format('HH:MM:ss')+'</td>';
							html +='<td>'+callState+'</td>';
							html +='<td>'+pinState+'</td>';
						}else{
							html +='<td> </td>';
							html +='<td> </td>';
							html +='<td> </td>';
						}
					}else{
						html +="<td> </td>";
						html +="<td> </td>";
						html +="<td> </td>";
						html +="<td> </td>";
					}
				}
				html +='</tr>';
			}

			html +='<tr class="separator">';
			for(var i=0; i<13; i++){
				html +="<td> </td>";
			}
			html +='</tr>';

		});
		html +='</tbody>';
		html+='</table></div>';
	});

	$('#content').html(html);
}


function printErrors(errors){

	if(!errors){
		$('#call-errors-btn').hide();
		$('#call-errors-modal .modal-body').html('');
	}else{
		$('#call-errors-btn').show();
		var html = "<table>" +
				"<tr>" +
				"<th>"+translations.Name+"</th>" +
				"<th>"+translations.Number+"</th>" +
				"<th>"+translations.Start+"</th>" +
				"<th>"+translations.Info+"</th>" +
				"</tr>";

		$.each(errors, function(id, pool){
			$.each(pool, function(name, calls){
				for(var i=0; i < calls.length; i++){

					var start = '';
					if(calls[i].start){
						start = calls[i].start.format('yyyy/mm/dd HH:MM')
					}
					html += "<tr>" +
					"<td>"+name+"</td>" +
					"<td>"+calls[i].number+"</td>" +
					"<td>"+start+"</td>" +
					"<td>"+calls[i].tags.join(', ')+"</td>" +
					"</tr>";
				}
			});
		});

		html += "</table>";

		$('#call-errors-modal .modal-body').html(html);
	}
}


function countCalls(numbers){
	var count = 1;
	$.each(numbers, function(number, callsPool){
		count+=callsPool.calls.length;
	});

	return count;
}

function getCallState(call){
	var tags = call.tags;
	var result = [];
	for(var i=0; i < tags.length; i++){
		var tag = tags[i];
		if(callsTags.indexOf(tag) >= 0){
			// if call tag
			if(translations.hasOwnProperty(tag)){
				tag = translations[tag];
			}
			result.push(tag);
		}
	}
	return result.join(', ');
}

function getPinState(call){
	var tags = call.tags;
	var result = [];
	for(var i=0; i < tags.length; i++){
		var tag = tags[i];
		if(pinTags.indexOf(tag) >= 0){
			// if pin tags
			if(translations.hasOwnProperty(tag)){
				tag = translations[tag];
			}
			result.push(tag);
		}
	}
	return result.join(', ');
}


function exportTableToCSV() {
	var $table = $('#content .callout table');
	var filename = 'export.csv';

    var $rows = $table.find('tr'),

        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

        // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row),
                $cols = $row.find('td, th');

            return $cols.map(function (j, col) {
                var $col = $(col),
                    text = $col.text();

                return text.replace(/"/g, '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"',

        // Data URI
        csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    $(this)
        .attr({
        'download': filename,
            'href': csvData,
            'target': '_blank'
    });
}
