# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-18

First public release.

### Added
- Daily toward (T) / away (A) polarity of the interplanetary magnetic field from NASA OMNI2 hourly
  Bx, By (GSE): `halfplane` rule (default) and `quadrant` rule (OMNIWeb daily polarity table).
- Quality tests for every day: minimum number of hours (`min_hours`, default 12) and minimum share of
  hours that agree with the daily polarity (`min_agreement`, default 0.75); the agreement is returned
  for every day.
- Download of the OMNI2 yearly files from NASA/GSFC SPDF (`download_omni2`), with atomic writes.
- Toward/away sorting of OMNI2 geomagnetic quantities (Dst, Kp_x10, ap, AE, AL, AU, PC_N, Bz_GSM,
  E_field) or of a user data file, as Monthly, Calendar-month and Season tables (`sort_fields`).
- CSV and Excel output (`to_excel`), a command line (`imf-polarity`, or `python -m imf_polarity`) and a
  desktop window (`imf-polarity-gui`, or `python -m imf_polarity.gui`).
- Plot of T - A by calendar month and by season with 95 % intervals from the year-to-year scatter
  (`plot_ta`, `yearly_intervals`; needs the optional `plot` extra).
- 16 known-answer tests and validation against the OMNIWeb daily polarity table and the ground-based
  C7 polarity set.
- Packaging and community files: full `pyproject.toml` metadata with dependency ranges, console
  commands, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, a continuous-integration workflow
  (Linux, Windows, macOS; Python 3.9 to 3.12) and API documentation (`docs/API.md`).
- Type hints and input checks with explicit error messages on all public functions.

### Fixed
- `to_excel` now blanks unlabelled days with `where` instead of `replace("", None)`; with pandas < 2.0,
  `replace(value, None)` forward-fills instead of blanking. Results with pandas >= 2.0 are unchanged.
