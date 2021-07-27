let schemaBuilder = lf.schema.create("todo", 1);
schemaBuilder
	.createTable("Item")
	.addColumn("id", lf.Type.INTEGER)
	.addColumn("product", lf.Type.STRING)
	.addColumn("done", lf.Type.BOOLEAN)
	.addPrimaryKey(["id"], true);

let todoDb;
let item;

schemaBuilder.connect().then(function (db) {
	todoDb = db;
	item = db.getSchema().table("Item");
    showResults();
});

function createItem(product) {
	let row = item.createRow({
		product: product,
		done: false,
	});
    let content = {
        id: 0,
        product: product,
        done: false
    }
	todoDb.insertOrReplace().into(item).values([row]).exec().then(
        function(rows) {
            content.id = rows[0].id;
        });
    return content;
    
}

async function updateItem(id, value) {
	await todoDb
		.update(item)
		.set(item.done, value)
		.where(lf.op.and(item.id.eq(id)))
		.exec();
}

function deleteItem(id) {
	todoDb.delete().from(item).where(item.id.eq(id)).exec();
}

function showResults() {
	todoDb
		.select()
		.from(item)
		.exec()
		.then(function (results) {
			showItems(results)
		});
}

function showItems (lists) {
    let html = "";
    lists.forEach(list => {
        html = createHtml(list.id, list.product, list.done);
        $(".listContainer").prepend(html);
    });
}

function createHtml(id, product, done) {

	let className = done ? "done" : "";
    let justifyContent = done ? "style='justify-content: flex-start' " : "";
    let tick = done ? "" : `<span class="iconHolder tickIcon">
            <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="check-circle" class="svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" >             
                <path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"></path>
            </svg>
        </span>`

	return `<div class="listItem ${className}" data-id="${id}">
    ${tick}
    <span class="listItemContent" ${justifyContent}>${product}</span>
    <span class="iconHolder delIcon">
        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="trash-alt" class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" >
            <path fill="currentColor" d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"></path>
        </svg>
    </span>
    </div>`;
}

$("span.plusIcon").click(function () {
	let product = prompt("Enter a Product Name: ");
	if (product == null || product == "") {
		return;
	}
	let content = createItem(product);
    let html = createHtml(content.id, content.product, content.done);
    $(".listContainer").prepend(html);
});

$(document).on("click", ".tickIcon", async function () {
    let id = $(this).parent().data("id");
    await updateItem(id, true);
    $(this).parent().addClass("done");
    $(this).parent().find(".listItemContent").css("justify-content", "flex-start");
    $(this).parent().find(".tickIcon").remove();
})

$(document).on("click", ".delIcon", function () {
    let id = $(this).parent().data("id");
    console.log(id)
    deleteItem(id)
    $(this).parent().fadeOut();
})