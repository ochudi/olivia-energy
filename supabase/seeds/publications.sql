-- =====================================================================
-- Publications — Dr Olugbenga Olaoye's journal articles.
--
-- Runs on `supabase db reset` (after seed.sql, via config.toml sql_paths)
-- and can be run by hand against any project:
--   psql "$DATABASE_URL" -f supabase/seeds/publications.sql
-- Idempotent: a paper is inserted only if no row already has its URL, so
-- re-running it never duplicates a paper or overwrites an admin's edits.
--
-- Sources (checked 2026-09-29): Crossref metadata for every DOI, the
-- founder's OpenAlex author record (A5091615039) and ORCID record
-- (0000-0003-2658-916X), and the journal pages. Authors are listed in
-- citation order, as each byline prints them. Each summary is one neutral
-- sentence written from the published abstract.
--
-- Featured: the six papers in energy and environmental economics, which is
-- the practice's field. The three others are listed unfeatured.
--
-- Not included: "An Econometric Analysis of Clean Energy Supply and
-- Industrial Development in Nigeria" (IJEEP 12(3), 2022,
-- doi:10.32479/ijeep.13109). Its byline and Crossref record name
-- Olusegun Peter Olaoye of Covenant University's Academic Planning Unit,
-- and neither OpenAlex nor ORCID lists it for the founder.
-- =====================================================================

insert into olivia_energy.publications
  (title, authors, venue, year, url, summary, featured, sort)
select v.title, v.authors, v.venue, v.year, v.url, v.summary, v.featured, v.sort
from (
  values
    (
      'Environmental Regulatory Standards, Energy Consumption, and Environmental Quality in Lower Middle-Income Sub-Saharan Africa: The Role of Structural Breaks',
      array['Olugbenga O. Olaoye', 'Ebenezer Bowale', 'Olabanji O. Ewetan']::text[],
      'International Journal of Energy Economics and Policy',
      2025,
      'https://doi.org/10.32479/ijeep.17131',
      'Examines how environmental regulation and structural breaks affect the link between energy use and environmental quality in 18 middle-income Sub-Saharan African countries from 1991 to 2022.',
      true,
      10
    ),
    (
      'Financial Inclusion on the Nexus between Environmental Quality and Energy Consumption in Low-Income Sub-Saharan Africa',
      array['Olugbenga O. Olaoye', 'Ebenezer Bowale', 'Olabanji O. Ewetan']::text[],
      'International Journal of Energy Economics and Policy',
      2025,
      'https://doi.org/10.32479/ijeep.17123',
      'Examines whether financial inclusion changes the effect of energy use on environmental quality in 20 low-income Sub-Saharan African countries from 1991 to 2022.',
      true,
      20
    ),
    (
      'Examining the Role of Trade on the Relationship between Environmental Quality and Energy Consumption: Insights from Sub Saharan Africa',
      array['Olugbenga Olaposi Olaoye', 'Faruq Umar Quadri', 'Oluwaseun Oladeji Olaniyi']::text[],
      'Journal of Economics, Management and Trade',
      2024,
      'https://doi.org/10.9734/jemt/2024/v30i61211',
      'Examines how trade affects the relationship between energy consumption and environmental quality in 35 low- and middle-income Sub-Saharan African economies from 1996 to 2020.',
      true,
      30
    ),
    (
      'Environmental Quality, Energy Consumption and Economic Growth: Evidence from Selected African Countries',
      array['Olugbenga Olaoye']::text[],
      'Green and Low-Carbon Economy',
      2024,
      'https://doi.org/10.47852/bonviewglce3202802',
      'Estimates the links between carbon emissions, energy consumption and economic growth in selected African countries from 1981 to 2019, using panel cointegration methods.',
      true,
      40
    ),
    (
      'Energy Use, Financial Development and Pollution in Selected African Countries',
      array['Olugbenga Olaoye', 'Risikat O. S. Dauda']::text[],
      'Journal of Economic Impact',
      2022,
      'https://doi.org/10.52223/jei4032205',
      'Examines how energy use and financial development affect carbon emissions in selected African countries from 1981 to 2019.',
      true,
      50
    ),
    (
      'Corporate finance, industrial performance and environment in Africa: Lessons for policy',
      array['Ekundayo Peter Mesagan', 'Titilope Comfort Adewuyi', 'Olugbenga Olaoye']::text[],
      'Scientific African',
      2022,
      'https://doi.org/10.1016/j.sciaf.2022.e01207',
      'Examines how corporate finance and industrial performance affect pollution in 36 African countries from 1990 to 2020.',
      true,
      60
    ),
    (
      'Transforming Tax Compliance with Machine Learning: Reducing Fraud and Enhancing Revenue Collection',
      array['Samuel Oladiipo Olabanji', 'Oluwaseun Oladeji Olaniyi', 'Olugbenga Olaposi Olaoye']::text[],
      'Asian Journal of Economics, Business and Accounting',
      2024,
      'https://doi.org/10.9734/ajeba/2024/v24i111572',
      'Reviews the literature on machine learning in tax administration, covering fraud detection and revenue collection and the data, privacy and ethical barriers to adoption.',
      false,
      70
    ),
    (
      'Interplay of Islam and Economic Growth: Unveiling the Long-run Dynamics in Muslim and Non-Muslim Countries',
      array['Faruq Umar Quadri', 'Oluwaseun Oladeji Olaniyi', 'Olugbenga Olaposi Olaoye']::text[],
      'Asian Journal of Education and Social Studies',
      2023,
      'https://doi.org/10.9734/ajess/2023/v49i41226',
      'Examines the long-run relationship between Islam and economic growth across 47 Muslim and non-Muslim countries from 2010 to 2021.',
      false,
      80
    ),
    (
      'Effects of Information Governance (IG) on Profitability in the Nigerian Banking Sector',
      array['Oluwaseun O. Olaniyi', 'Olugbenga O. Olaoye', 'Olalekan J. Okunleye']::text[],
      'Asian Journal of Economics, Business and Accounting',
      2023,
      'https://doi.org/10.9734/ajeba/2023/v23i181055',
      'Examines whether information governance policies help Nigerian banks limit data breaches and improve profitability, using a mixed-methods approach.',
      false,
      90
    )
) as v(title, authors, venue, year, url, summary, featured, sort)
where not exists (
  select 1 from olivia_energy.publications p where p.url = v.url
);
