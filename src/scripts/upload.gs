const FACULTY_NAME_IDX = 0; 
const COURSE_DPT_IDX = 2;
const COURSE_NUM_IDX = 3;
const OFFICE_HR_TIME_START_IDX = 4;
const NUM_OFFICE_HR_REQUIRED_ATTR = 5;
const API_URL = 'http://localhost:3000/api/officeHour/upload'

function setUpTrigger() {
    ScriptApp.newTrigger('onSubmit')
      .forForm('1vZtl3GzTVFGFcvKPJfgTMQWUri_4c-aRcnjTzz_b0UI')
      .onFormSubmit()
      .create();
}

function onSubmit(e) {
  const form = FormApp.openById('1vZtl3GzTVFGFcvKPJfgTMQWUri_4c-aRcnjTzz_b0UI');

  // get all the responses from the google form
  const formResponses = form.getResponses();

  // get the last response
  const formResponse = formResponses[formResponses.length - 1];

  // get all the individual item from the last response
  const itemResponses = formResponse.getItemResponses();

  const facultyName = itemResponses[FACULTY_NAME_IDX].getResponse();
  const courseDpt = itemResponses[COURSE_DPT_IDX].getResponse();
  const courseNUM = itemResponses[COURSE_NUM_IDX].getResponse();

  const officeHourSections = [];
  const str = "";

  // iterate over each individual item from the last response
  for(var i = OFFICE_HR_TIME_START_IDX; i < itemResponses.length; i+=(NUM_OFFICE_HR_REQUIRED_ATTR+1)) {
    const officeHourSectionInfo = {};

    officeHourSectionInfo.facultyName = facultyName;
    officeHourSectionInfo.courseDepartment = courseDpt;
    officeHourSectionInfo.courseNumber = courseNUM;

    for (var j = 0; j < NUM_OFFICE_HR_REQUIRED_ATTR; j++) {
      const item = itemResponses[i+j];

      // grab the tile 
      const keyName = item.getItem().getTitle();

      // grab the item response
      officeHourSectionInfo[keyName] = item.getResponse();

      // const a = sendRequest(officeHourSectionInfo);
      // str += JSON.stringify(a);
    }

    officeHourSections.push(officeHourSectionInfo)
  }

  const recipient = e.response.getRespondentEmail();
  const subject = "test user email";
  const body = JSON.stringify(officeHourSections) + str;

  GmailApp.sendEmail(recipient, subject, body);
}

function sendRequest(officeHourSectionInfo) {
  const options = {
    method: 'POST',
    payload: officeHourSectionInfo,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = UrlFetchApp.fetch(API_URL, options);

}
