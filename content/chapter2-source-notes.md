# 第二章解析核對紀錄

核對日期：2026-10-01。範圍為 `site/questions.js` 的第 92–263 題，共 172 題；解析檔為 `content/explanations-chapter2.json`。逐題閱讀題目、全部選項與題庫答案，未變更題庫答案及計分依據。

主要依據為民航局《遙控無人機學科測驗指南》（AC 107-004B 附錄 1，2022 年版本）§1.4–1.5 與第 3 章。已讀取官方 PDF 的抽出文字，並以 NASA、FAA、PX4、GPS.gov 與製造商文件交叉核對。題目中較寬泛的說法，在解析說明適用前提；有術語差異、簡化或疑義者加上 `note`，不把考試答案當成完整的物理敘述。

## 主要來源與核對用途

- [民航局學科測驗指南索引](https://www.caa.gov.tw/Article.aspx?a=3718&lang=1)及[官方 PDF](https://www.caa.gov.tw/FileAtt.ashx?id=29275&lang=1)：本國題庫用語、無人機系統、空氣動力、固定翼與旋翼操作、重量平衡。
- [NASA 牛頓運動定律](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/)、[伯努利方程式](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation/)、[升力方程式](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/)、[誘導阻力](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/induced-drag-coefficient/)及[螺旋槳幾何定義](https://www.nasa.gov/reference/openvsp-propellers/)：力的方向、速度與壓力的適用條件、攻角與幾何槳距的差別。
- FAA《Pilot’s Handbook of Aeronautical Knowledge》[第 4 章](https://www.faa.gov/sites/faa.gov/files/06_phak_ch4_0.pdf)、[第 5 章](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/phak/07_phak_ch5.pdf)、[第 10 章](https://www.faa.gov/sites/faa.gov/files/12_phak_ch10.pdf)：升力、阻力、穩定性、載重因數及重心限制；[第 16 章](https://www.faa.gov/sites/faa.gov/files/18_phak_ch16.pdf)補充風、航向與航跡的差別。
- [PX4 感測器文件](https://docs.px4.io/main/en/sensor/)、[飛控控制器](https://docs.px4.io/main/en/flight_stack/controller_diagrams)、[資料鏈路](https://docs.px4.io/main/en/data_links/)及[多旋翼組態](https://docs.px4.io/v1.15/en/config_mc/)：感測、閉迴路控制、多旋翼混控與遙測。
- [GPS.gov 干擾說明](https://www.gps.gov/spectrum-interference-issues)及[FAA AIM 導航章節](https://www.faa.gov/air_traffic/publications/aim_html/chap1_section_1.html)：衛星定位限制與慣性導航。
- [Insitu ScanEagle](https://www.insitu.com/products/scaneagle)、[AeroVironment Puma LE](https://www.avinc.com/solution/puma-le/)及[美國海軍 Pioneer](https://www.navy.mil/DesktopModules/ArticleCS/Print.aspx%3FPortalId%3D1%26ModuleId%3D724%26Article%3D2166538)：彈射、手拋、攔截線／網等實際機型例子。範例只證明該方法存在，不推論所有無人機都適用。

## 需要注意的題庫表述

- 第 126 題：風可改變航跡／地速；固定航向下的均勻側風不必然改變機頭航向，題庫將兩者混用。
- 第 136 題：連續方程式描述流量守恆，壓力與速度的關係還需要伯努利方程式及其前提。
- 第 141 題：不能用「上下表面氣流必須同時抵達後緣」解釋升力；解析以壓力分布與氣流偏轉說明。
- 第 145 題：題庫的槳「攻角」敘述較接近幾何槳距角，真正攻角還取決於相對氣流方向。
- 第 178、192 題：固定翼的五大構造不能套用到全部無人機；無人機通常沒有機上供駕駛閱讀的儀表板，仍有飛控感測器及地面遙測。
- 第 214 題：題庫結論以旋翼推力朝上等條件為前提；合力必須按方向合成，不能把四種力一律直接相加比較。
- 第 237 題：題庫聚焦重量與重心；機身尺寸與電池特性也會影響性能，不能理解為完全無關。
- 第 243 題：穩定水平直線飛行時升力約等於重量；保持高度的協調轉彎等狀況才需要總升力大於重量。
- 第 250 題：前重心通常增加縱向穩定性，但也可能使起飛抬頭與落地拉平困難，並非越前越安全。

另有部分題目存在機型差異、用詞簡化或須補上操作前提，已直接記在該題 `note`。有註記的題號為：102、110、116、117、118、119、126、133、134、136、141、145、150、154、178、186、191、192、200、214、234、235、237、243、244、250、253、256。

## 核對範圍限制

上述指南本身也使用一些入門教學簡化；因此解析保留官方考試用語，同時標明嚴格物理定義及操作前提。來源支持原理，並不取代特定機型的飛行手冊。此檔不宣稱所有題庫表述都不存在歧義，也不自行改動官方答案。
