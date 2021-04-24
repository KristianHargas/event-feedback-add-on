# GoodRequest: Event Feedback Add-on

Ahoj **GoodRequest**!

Toto je implementácia [Google Calendar Add-on pre zber feedbacku eventov](https://www.goodrequest.com/blog/google-calendar-add-on).

Aplikácia bola otestovaná v prostredí **Google Workspace** a jej demo si môžete pozrieť na [tomto videjku](https://drive.google.com/file/d/1j_6M_JEejQYQCFSbMVdTtsOVS4m-7Lhk/view?usp=sharing).

Čo sa týka zadania, mali by byť splnené všetky body, okrem *anonymného zápisu hodnotenia na koniec popisu eventu*. Ak má event nastavené, že ho môžu meniť účastníci eventu, tak ak cez web Google kalendára účastník zmení napr. popis eventu, táto zmena je reflektovaná aj v kalendári organizátora a ostatných účastníkov. Keď som sa snažil to isté vykonať v kóde, tak bola vždy zmena eventu účastníkom reflektovaná iba lokálne v jeho kalendári. Nikdy sa mi to nepodarilo preklopiť k organizátorovi. Po dlhom googlení sa mi podarilo nájsť príspevok na [StackOverflow](https://stackoverflow.com/questions/63259190/an-event-that-is-guests-can-modify-is-not-update-via-google-calendar-api), ktorý vlastne v odpovedi obsahuje link na [IssueTracker](https://issuetracker.google.com/issues/36757203). Z uvedeného mi vyplynulo, že táto funkcionalita teda nie je zatiaľ podporovaná.

Ak máte nejaké pripomienky, tak ich tam môžem kľudne zapracovať :)
