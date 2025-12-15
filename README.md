# SSPS Auticka
Software na monitorovaní spz, a small scale parkovist.

## Contributing Guidelines
- pls použivejte tohle https://gist.github.com/pmutua/7008c22908f89eb8bd21b36e4f92b04f (rikal ucitel)
- Vždy vytvořte branch a jako skupina pracujte jen v něm
- jednou za čas funkční verze mergneme
- 👍

## Sub-projekt 1 — SPZ Detekce
nwm dopiste si

### Funkce
- [ ] Funkce 1  
- [ ] Funkce 2  
- [ ] Funkce 3  

## Sub-projekt 2 — Parkoviste Detekce
mapuje detekuje a indexuje, prakovací místa a předává je databázi

### Funkce
- [x] Mapování 
- [x] Live Detekce a Ubdaty  

## Sub-projekt 3 — Python Brige
brige je proprietary python modul k predávaní informací mezi Detekcí a Databází/backendem
Stará verze https://github.com/KikoStudios/old-python-brige
- [ ] Auth (autentikace spise pozdeji musim dodelat)
- [ ] Push parkoviste kapacita (jednotlive a bulk)
- [ ] SPZ History
- [ ] SPZ In/Out
- [ ] Workfow HIstory a InOut paraelne
- [ ] Pull data (pozdejsi) 

### Funkce
- [ ] Možnost synchonizace manualne do specifickych polí databáze
- [ ] One line na synchronizaci specificky parkovacích míst
- [ ] Bulk synchronizace parkovacích míst

## Overall veci 
- [ ] SPZ synch auticka.spz(data)
- [ ] Mista dynch auticka.park(index,state)
- [ ] autorizace, omezeni pristupu aby nikdo nerozbil db a autorizace jak pro development(je potreba jen url), tak prod(private key)

## Sub-projekt 4 — Dashboard Backend
Akceptování dat z backendu a dynamicke zobrazování modulů

### Funkce
- [x] Definice databaze
- [x] Convex integrace pro synchronizaci 
- [ ] Fixnout convex x module data brige
- [ ] loadovant moduly na loginu
- [ ] fixnout to ze se profilr ozbije kdyz editne svoje vlastni moduly
- [ ] pridat dev roli

## Sub-projekt 4 — CLI Runtime
spousteni databaze serveru a frontendu na jednom pocitaci jednoduse 

### Funkce
- [ ] docker
- [ ] integrace serveru db a frontendu(buildleho)

## DODATEK
vec v listu splnite tim ze v - [ ] napisete x takze - [x]
