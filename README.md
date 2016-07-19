# Alert-call System

##Introduction

Alert System for Wildix PBXs allows to start an Alert call to reach persons and see if they are available. Each contact called must authenticate using a pin and then accept 0 or decline the call 1.

A Web Application allows to monitor how the alarm call is proceeding.

##How it works

* call each contact in a phonebook
* for each contact try up to three phone numbers
* for each phone number try up to three times
* for each try ask a pin after the contact has answered (as entered in the field "Document Number")
* if the pin is successful ask to press 0 or 1

##Upload sounds

Upload the following sound files to WMS using exactly the following names:

* pin_test_or_real_start – start a test or real alert call
* pin_accepted – confirmation pin has been accepted
* 0_confirm_1_refuse – press 0 to accept the alert call, 1 to refuse the alert call
* call_out_test – confirm that alert call system in test mode was started
* call_out_real – confirm that alert call system was started

##Create a new dialplan rule “events_dialplan”

in Dialpan -> Dialplan rules menu and add two extensions which are used as pin to start a test or real alert call:

example:

123 Application: Set EVENT_NAME call_out_test
    Application: Play sound call_out_test

456 Application: Set EVENT_NAME call_out_real
    Application: Play sound call_out_real 

##Enter in users dialplan the new Alert Code Feature

usage example 222, Application: Set CallOut, Parameters:callOutPb,8,events_dialplan,users the parameters are:

* callOutPb – the phone book where the contacts are stored
* 8 – the number of contemporary alert calls which should be generated
* the dial plan where the pin inserted should be looked up
* the dial plan where the outgoing calls should be generated

##Before starting our first alert call we need to create the phonebook indicated above: callOutPb

Three numbers  will be called for each contact: Extension, Work, Mobile

The pin must be stored in the field "Document Number"

##Install

Uncompress this project zip file and upload it using the admin user of the PBX to the directory /var/www/

##Usage

Connect to the Web Interface at page https://pbxdomain/Alert-call

Dial 222 using the PBX, monitor the Alert progress via the Web Interface
