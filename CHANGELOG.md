# Changelog

## 0.1.1

Fix: Get Date Part generated a multi-declarator `var` that the FFDec AS2 compiler rejects ("CURLY_CLOSE expected but COMMA found"), so any graph using it failed to build. The declarations are now separate statements.

## 0.1.0

First release: 10 pure nodes (category Time), all `datetimeutils/<Kind>@1`. A timestamp is a number of seconds since 1970-01-01 UTC.

- Durations (seconds): Format Duration, Get Duration Part, To Seconds, Format Time Ago.
- Clock and calendar text: Format Time Of Day, Month Name, Weekday Name.
- Real-world clock and calendar: Now (volatile, never cached), Get Date Part (year, month, day, hour, minute, second, weekday, day of year; UTC or local), Make Timestamp (UTC).

Negative or non-numeric durations and timestamps count as 0. The three clock nodes use Flash's `Date` class, checked in Skyrim SE 1.7.104 with a spike menu on 2026-11-01 (`new Date()`, `getTime`, the `getUTC*` and local getters, `getTimezoneOffset` and `Date.UTC` all worked).
