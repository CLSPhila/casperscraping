# Web scraper for Expungement Generator

Uses the headless browser, CasperJS, to use the AOPC's website and collect
criminal records docket information.

## Usage

```
    me$ casperjs searchCPCMS.js --helpMe
    This script navigates the AOPC website automatically.
    It requires that you provide a first and last name and, optionally, a DOB.
      --first=FIRSTNAME
      --last=LASTNAME
      --DOB=DOB (Note that this should be in the form MM/DD/YYYY with leading zeros.  If a DOB is missing, the script will return only the first page of results (this is to give the user some dobs to search on))
      --mdj Searches the MDJ website instead of the CP website
      --chatty Prints with lots of verbosity
      --limit Limits the output to only one page of results
      --test  If you want to run in test mode, just include this flag
      --helpMe  Prints this message
    The exit status codes are:
    {
        "success": 0,
        "noDocketsFound": 1,
        "failure": 2
    }
```

N.B.
-Can run and specific tests with executables in tests.
-Can save output and print to console with: `command | tee -a log_file`
