# DateTimeUtils

An Inkwell node pack with 10 time nodes (Format Duration, Get Duration Part, To Seconds, Format Time Of Day, Format Time Ago, Month Name, Weekday Name, Now, Get Date Part, Make Timestamp), all pure, in the category Time. Pack id `datetimeutils`; nodes are `datetimeutils/<Kind>@1`. See `CHANGELOG.md` for the list.

```
manifest.json        pack id, version, compatible tool range
nodes/<Kind>.json    one node definition per file
templates/<Kind>.as2 the AS2 each node generates (one expression)
test/                node --test: templates agree with their pins, and every node has known-answer cases
```

Commands (Inkwell-Core-Pack and Inkwell-Spec checked out next to this folder; run `yarn build` in Inkwell-Spec once): `yarn install`, `yarn validate`, `yarn test`.

Add it in the editor with Assets > Node packs > Add Pack and `Inkwell-UI/Inkwell-DateTimeUtils-Pack`. Release: bump `version` in `manifest.json`, add a `CHANGELOG.md` entry, push the tag `v<version>`.

Behaviour worth knowing:

- Durations are seconds (Core's Get Time gives seconds; subtract two readings for a duration). Negative, infinite or non-numeric values count as 0.
- Format Duration gives `m:ss`, or `h:mm:ss` from one hour (always, with the `alwaysHours` field). `decimals` (0-3) cuts digits off instead of rounding, so 59.999 never shows as 60.00. Hours do not roll into days: 25 hours is `25:00:00`.
- Get Duration Part returns the part left over at that level (1 h 5 m 7 s gives 1, 5, 7); use `days` for whole days.
- Format Time Of Day takes an hour 0-24 (fractions are minutes), wraps around midnight, and writes `3:30 PM` or `15:30`.
- Month Name (1-12) and Weekday Name (0 = Sunday) give `""` out of range.

- A timestamp is a Number of seconds since 1970-01-01 UTC. Now gives the real-world time (the PC clock, not Skyrim's game time) in whole seconds and is volatile: it is read again at every use. Get Date Part reads one part of a timestamp (month 1-12, weekday 0 = Sunday, day of year 1-366), in UTC by default or in the player's time zone with `utc` off. Make Timestamp builds a UTC timestamp; fields out of range roll over (month 13 is January of the next year) and years 0-99 mean 1900-1999, as in Flash. A negative or non-numeric timestamp counts as 0.
- These three nodes use Flash's `Date` class. It was checked in Skyrim SE 1.7.104 (the in-game spike `samples/menu-date-spike` of Inkwell-Editor, 2026-11-01); other game versions were not tested.

Skyrim's own game date and time of day live in Papyrus and are out of scope: Now is the real clock.
