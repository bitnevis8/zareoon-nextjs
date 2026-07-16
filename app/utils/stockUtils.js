import i18nData from "./i18nFaData";

export function getStockLegend(t) {
  return [
    { className: "stock-empty", label: t("stock.empty"), range: t("stock.emptyRange") },
    { className: "stock-low", label: t("stock.low"), range: t("stock.lowRange") },
    { className: "stock-medium", label: t("stock.medium"), range: t("stock.mediumRange") },
    { className: "stock-high", label: t("stock.high"), range: t("stock.highRange") },
  ];
}

export function getStockClass(availableStock) {
  if (availableStock === 0) return "stock-empty";
  if (availableStock < 5000) return "stock-low";
  if (availableStock < 20000) return "stock-medium";
  return "stock-high";
}

export function calculateParentStockQuantity(products, parentId, inventoryLots = []) {
  let totalStock = 0;

  const findChildrenRecursive = (currentParentId) => {
    const directChildren = products.filter((p) => p.parentId === currentParentId);
    console.log(`Looking for children of parent ${currentParentId}, found ${directChildren.length} children`);
    directChildren.forEach((child) => {
      if (child.isOrderable) {
        const productLots = inventoryLots.filter((lot) => lot.productId === child.id);
        console.log(`Product ${child.name} (${child.id}): ${productLots.length} inventory lots`);
        if (productLots.length > 0) {
          const childTotalStock = productLots.reduce((sum, lot) => {
            const total = parseFloat(lot.totalQuantity || 0);
            return sum + (isNaN(total) ? 0 : total);
          }, 0);
          const childReservedStock = productLots.reduce((sum, lot) => {
            const reserved = parseFloat(lot.reservedQuantity || 0);
            return sum + (isNaN(reserved) ? 0 : reserved);
          }, 0);
          const childAvailableStock = childTotalStock - childReservedStock;

          if (childAvailableStock > 0) {
            totalStock += childAvailableStock;
            console.log(`Added ${childAvailableStock} kg from ${child.name}`);
          }
        }
      } else {
        console.log(`Recursing into category ${child.name} (${child.id})`);
        findChildrenRecursive(child.id);
      }
    });
  };

  findChildrenRecursive(parentId);

  return totalStock;
}

export async function getHierarchicalStock(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/hierarchical-stock`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching hierarchical stock:", error);
    return null;
  }
}

export function calculateHierarchicalStockLocal(product, allProducts, inventoryLots = []) {
  const result = {
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    batches: [],
    children: [],
  };

  if (product.isOrderable) {
    const productLots = inventoryLots.filter((lot) => lot.productId === product.id);

    const batchesByGrade = {};
    productLots.forEach((lot) => {
      const grade = lot.qualityGrade || i18nData.noGrade;
      if (!batchesByGrade[grade]) {
        batchesByGrade[grade] = {
          grade: grade,
          totalStock: 0,
          availableStock: 0,
          reservedStock: 0,
          lots: [],
        };
      }

      const total = parseFloat(lot.totalQuantity || 0);
      const reserved = parseFloat(lot.reservedQuantity || 0);
      const available = total - reserved;

      batchesByGrade[grade].totalStock += total;
      batchesByGrade[grade].availableStock += available;
      batchesByGrade[grade].reservedStock += reserved;
      batchesByGrade[grade].lots.push({
        id: lot.id,
        totalQuantity: total,
        availableQuantity: available,
        reservedQuantity: reserved,
        unit: lot.unit,
        status: lot.status,
      });
    });

    result.batches = Object.values(batchesByGrade);
    result.totalStock = result.batches.reduce((sum, batch) => sum + batch.totalStock, 0);
    result.availableStock = result.batches.reduce((sum, batch) => sum + batch.availableStock, 0);
    result.reservedStock = result.batches.reduce((sum, batch) => sum + batch.reservedStock, 0);
  } else {
    const children = allProducts.filter((p) => p.parentId === product.id && p.isActive);

    for (const child of children) {
      const childStock = calculateHierarchicalStockLocal(child, allProducts, inventoryLots);
      result.children.push({
        product: {
          id: child.id,
          name: child.name,
          isOrderable: child.isOrderable,
        },
        stock: childStock,
      });

      result.totalStock += childStock.totalStock;
      result.availableStock += childStock.availableStock;
      result.reservedStock += childStock.reservedStock;
    }
  }

  return result;
}

export function calculateAvailableStock(product, allProducts, inventoryLots = []) {
  if (!product || !allProducts) return 0;

  if (product.isOrderable) {
    const productLots = inventoryLots.filter((lot) => lot.productId === product.id);
    if (productLots.length > 0) {
      const totalStock = productLots.reduce((sum, lot) => {
        const total = parseFloat(lot.totalQuantity || 0);
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
      const reservedStock = productLots.reduce((sum, lot) => {
        const reserved = parseFloat(lot.reservedQuantity || 0);
        return sum + (isNaN(reserved) ? 0 : reserved);
      }, 0);
      return totalStock - reservedStock;
    }
    return 0;
  }

  return calculateParentStockQuantity(allProducts, product.id, inventoryLots);
}

export function getProductStockClass(product, allProducts, inventoryLots = []) {
  if (!product || !allProducts) return "stock-empty";

  console.log(
    `Getting stock class for: ${product.name} (${product.id}), isOrderable: ${product.isOrderable}, parentId: ${product.parentId}`
  );

  if (product.id === 1001) {
    const wheatProducts = allProducts.filter((p) => p.parentId === 1001);
    console.log(
      `Wheat products in allProducts:`,
      wheatProducts.map((p) => `${p.name} (${p.id}, orderable: ${p.isOrderable})`)
    );
  }

  const availableStock = calculateAvailableStock(product, allProducts, inventoryLots);
  console.log(`${product.name} (${product.id}): ${availableStock} kg available stock`);

  return getStockClass(availableStock);
}
