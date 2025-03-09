export const convertToBangkokTime = (utcMilisec: number) => {
	const date = new Date(utcMilisec + 7 * 60 * 60 * 1000); // Bangkok is UTC+7
	return date;
};

export function isBusinessHour(date: Date) {
	return date.getHours() >= 10 && date.getHours() <= 17 ? date.getMinutes() < 30 : false;
}

export function isWeekend(date: Date) {
	return date.getDay() === 0 || date.getDay() === 6;
}
