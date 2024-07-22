const libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PNF = libphonenumber.PhoneNumberFormat;

function convertToE164(phoneNumber) {
  try {
      // Default to US region if the phone number doesn't start with a "+"
      const region = phoneNumber.startsWith('+') ? null : 'US';
      const number = phoneUtil.parseAndKeepRawInput(phoneNumber, region);
      return phoneUtil.format(number, PNF.E164);
  } catch (error) {
      console.error('Error parsing phone number:', error);
      return null;
  }
}

module.exports = {
    convertToE164,
};