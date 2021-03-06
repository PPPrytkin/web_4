const fs = require("fs").promises;
const path = require("path");

async function calculateSalesTotal(salesFiles) {
    let total = 0
    for (let file of salesFiles) {
        const data = JSON.parse((await fs.readFile(file)).toString())
        total += data.total
    }
    return total
}

async function findSalesFiles(folderName) {
    // массив будет содержать файлы продаж по мере их обнаружения
    let salesFiles = [];

    async function findFiles(folderName) {
        // чтение всех элементов в текущей папке
        const items = await fs.readdir(folderName, {withFileTypes: true});
        // перебор каждого найденного элемента
        for (let item of items) {
            // если элемент является каталогом, в нем нужно будет искать файлы
            // рекурсивно искать в этом каталоге файлы
            if (item.isDirectory()) {
                // если это папка, то этот метод вызывается снова и передается
                // рекурсивно сформированный путь к каталогу для поиска
                await findFiles(path.join(folderName, item.name));
            }
            // Убедитесь, что обнаруженный файл является файлом sales.json
            if (path.extname(item.name) === ".json") {
                await salesFiles.push(path.join(folderName, item.name));
            }
        }
    }

    // найти файлы продаж
    await findFiles(folderName);

    // вернуть массив найденных путей к файлам
    return salesFiles;
}

async function main() {
    const salesDir = path.join(__dirname, "stores");
    const salesTotalsDir = path.join(__dirname, "salesTotals");
    try {
        await fs.mkdir(salesTotalsDir);
    } catch {
        console.log(`${salesTotalsDir} уже существует!`);
    }
    const salesFiles = await findSalesFiles(salesDir);
    const salesTotal = await calculateSalesTotal(salesFiles);
    await fs.writeFile(
        path.join(salesTotalsDir, "result.txt"),
        `${salesTotal}\r\n`,
        {flag: "a"}
    );
}


main()