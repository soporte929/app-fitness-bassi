export const NUTRITION_TEMPLATES = [
    {
        name: 'Déficit moderado (-300 kcal)',
        kcal_target: 2200,
        protein_target_g: 165,
        carbs_target_g: 220,
        fat_target_g: 65,
        meals: [
            { name: 'Desayuno', kcal_per_100g: 150, protein_per_100g: 20, carbs_per_100g: 15, fat_per_100g: 4, default_grams: 300, meal_time: '08:00', order_index: 0 },
            { name: 'Media mañana', kcal_per_100g: 120, protein_per_100g: 15, carbs_per_100g: 10, fat_per_100g: 3, default_grams: 150, meal_time: '11:00', order_index: 1 },
            { name: 'Comida', kcal_per_100g: 130, protein_per_100g: 22, carbs_per_100g: 12, fat_per_100g: 3, default_grams: 400, meal_time: '14:00', order_index: 2 },
            { name: 'Merienda', kcal_per_100g: 100, protein_per_100g: 12, carbs_per_100g: 8, fat_per_100g: 2, default_grams: 200, meal_time: '17:00', order_index: 3 },
            { name: 'Cena', kcal_per_100g: 110, protein_per_100g: 20, carbs_per_100g: 8, fat_per_100g: 3, default_grams: 350, meal_time: '21:00', order_index: 4 },
        ]
    },
    {
        name: 'Volumen limpio (+300 kcal)',
        kcal_target: 3000,
        protein_target_g: 200,
        carbs_target_g: 350,
        fat_target_g: 80,
        meals: [
            { name: 'Desayuno', kcal_per_100g: 200, protein_per_100g: 25, carbs_per_100g: 30, fat_per_100g: 5, default_grams: 400, meal_time: '08:00', order_index: 0 },
            { name: 'Pre-entreno', kcal_per_100g: 180, protein_per_100g: 20, carbs_per_100g: 28, fat_per_100g: 3, default_grams: 250, meal_time: '11:00', order_index: 1 },
            { name: 'Comida', kcal_per_100g: 160, protein_per_100g: 28, carbs_per_100g: 18, fat_per_100g: 4, default_grams: 500, meal_time: '14:00', order_index: 2 },
            { name: 'Post-entreno', kcal_per_100g: 140, protein_per_100g: 25, carbs_per_100g: 15, fat_per_100g: 2, default_grams: 300, meal_time: '17:30', order_index: 3 },
            { name: 'Cena', kcal_per_100g: 150, protein_per_100g: 25, carbs_per_100g: 12, fat_per_100g: 5, default_grams: 450, meal_time: '21:00', order_index: 4 },
        ]
    },
    {
        name: 'Mantenimiento',
        kcal_target: 2500,
        protein_target_g: 175,
        carbs_target_g: 280,
        fat_target_g: 70,
        meals: [
            { name: 'Desayuno', kcal_per_100g: 160, protein_per_100g: 22, carbs_per_100g: 20, fat_per_100g: 4, default_grams: 350, meal_time: '08:00', order_index: 0 },
            { name: 'Comida', kcal_per_100g: 140, protein_per_100g: 24, carbs_per_100g: 15, fat_per_100g: 3, default_grams: 450, meal_time: '14:00', order_index: 2 },
            { name: 'Merienda', kcal_per_100g: 110, protein_per_100g: 14, carbs_per_100g: 10, fat_per_100g: 2, default_grams: 200, meal_time: '17:00', order_index: 3 },
            { name: 'Cena', kcal_per_100g: 130, protein_per_100g: 22, carbs_per_100g: 10, fat_per_100g: 4, default_grams: 400, meal_time: '21:00', order_index: 4 },
        ]
    },
]
