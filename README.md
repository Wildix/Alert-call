# Alert-call System

Min WMS Version: 3.82.32520.29

##Introduction

Alert System for Wildix PBXs allows to start an Alert call to reach persons and see if they are available. Each contact called must authenticate using a pin and then accept or decline the call.

A Web Application allows to monitor how the alarm call is proceeding.

##How it works

* call each contact in a phonebook
* for each contact try up to three phone numbers
* for each phone number try up to three times
* for each try ask a pin after the contact has answered (as entered in the field "Document Number")
* if the pin is successful ask to press confirm or refuse code (as set in the Alert Code parameters string, see below)

##Upload sounds

Upload the following sound files to WMS using exactly the following names:

* pin_test_or_real_start – start a test or real alert call
* call_out_test – confirm that alert call system in test mode was started
* call_out_real – confirm that alert call system was started
* enter_personal_pin – enter the personal pin
* wrong_pin – personal pin is wrong
* confirm_or_refuse – press confirm code to accept the alert call, refuse code to refuse the alert call
* procedure_complete – accepted entered pin or confirm code

Create the sound directories. In this exampe "snd", "call_out_test", "call_out_real":
* snd - for initial alert sounds (pin_test_or_real_start, wrong_pin, call_out_test, call_out_real, procedure_complete)
* call_out_test - for male test alert sounds (call_out_test, enter_personal_pin, wrong_pin, confirm_or_refuse, procedure_complete)
* call_out_real - for female real alert sounds (call_out_test, enter_personal_pin, wrong_pin, confirm_or_refuse, procedure_complete)
The name for male and female sound directory have to be same with EVENT_NAME (see below)

![Alt text](images/Sound_directories.jpeg?raw=true "Sound directories")

![Alt text](images/Initial_alert_sounds.jpeg?raw=true "Initial sounds")

![Alt text](images/Call_out_real_sounds.jpeg?raw=true "Call-out real sounds")

![Alt text](images/Call_out_test_sounds.jpeg?raw=true "Call-out test sounds")

##Create a new dialplan rule “events_dialplan”

in Dialpan -> Dialplan rules menu and add two extensions which are used as pin to start a test or real alert call:

example:

*123 Application: Set EVENT_NAME call_out_test*
    *Application: Play sound call_out_test*

*456 Application: Set EVENT_NAME call_out_real*
    *Application: Play sound call_out_real*

![Alt text](images/Create a new dialplan rule.jpeg?raw=true "Create dialplan")

##Enter in users dialplan the new Alert Code Feature

In this example we will use 222 as Alert Code number:

*222 Application: Set CallOut, Parameters:phonebook,8,events,users,30,1,3,snd*

parameters usage:

* callOutPb – the phone book where the contacts are stored
* 8 – the number of contemporary alert calls which should be generated
* the dial plan where the pin inserted should be looked up
* the dial plan where the outgoing calls should be generated
* 30 - retry count in case of channel unavailable
* 1 - confirm code
* 3 - refuse code
* snd - directory where to get initial alert sound files from

![Alt text](images/Add new Alert Code Feature.jpeg?raw=true "Create new code")

##Before starting our first alert call we need to create the phonebook indicated above: callOutPb

Three numbers  will be called for each contact: Extension, Work, Mobile

The pin must be stored in the field "Document Number"

![Alt text](images/Create the phonebook.jpeg?raw=true "Create phonebook")

![Alt text](images/Add contacts.jpeg?raw=true "Add contacts")

##Install

Uncompress this project zip file and upload the file AlertCalls.php from https://github.com/Wildix/Alert-call/tree/master/pbx/scripts to the PBX directory /var/www/scripts.


##Usage

Open index.html with a browser or alternatively load the content on a web server. Configure the needed parameters and enter a valid user phone number (login) and password in the settings.

Dial 222 and enter 123 or 456, monitor the Alert progress via the Web Interface

![Alt text](images/Report.jpeg?raw=true "Report")
