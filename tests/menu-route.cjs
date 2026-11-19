// Follow visible navigation; never bypass production menu handlers.
module.exports=async function clickActivity(page,activity){
 if(await page.locator('[data-operations]').count())await page.locator('[data-operations]').click();
 await page.locator(`[data-activity="${activity}"]`).click();
};
