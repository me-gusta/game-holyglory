<h1>
Демо-игра "HOLY GLORY"
</h1>

<img src="./readme/logo.png" alt="Logo" width="100">

Игра разрабатывалась летом 2025 года как проверка собственных способностей.

<h2>Механики и особенности гейм-дизайна</h2>
<ul>
    <li>Match 3 + автобатлер. Игроку необходимо пробираться через орды монстров, собирая комбо из рун разных типов>/li>
    <li>10 особых способностей персонажа>/li> 
    <li>Система квестов>/li>
    <li>Daily spin>/li>
    <li>Антистресс-кликер (на главном экране можно тапать по волку)>/li>
</ul>

<h2>Как это реализовано технически</h2>
<ul>
    <li>Node-based (a.k.a. Scene Tree) архитектура на PixiJS (./lib/BaseNode)</li>
    <li>Реактивное обновление данных</li>
    <li>setTimeout и Tween привязанные к requestAnimationFrame</li>
    <li>Рабочее меню из 7 экранов и UI-kit</li>
    <li>Покадровые анимации, спайны</li>
    <li>Автозагрузка ассетов с помощью vite virtual плагинов</li>
    <li>Particle-emitters</li>
    <li>Ресайзер экрана (только для вертикальных устройств)</li>
    <li>Все ассеты сгенерированы с помощью Sora</li>
</ul>
<h2>Демо-версия</h2>

Загрузка ~30 секунд (на белом экране)

https://holyglory-9f611.web.app/

<h2>Скриншоты</h2>

<img src="./readme/main.png" alt="Logo" width="200">

<img src="./readme/in-battle.png" alt="Logo" width="200">

<img src="./readme/spin.png" alt="Logo" width="200">

<img src="./readme/spells.png" alt="Logo" width="200">
