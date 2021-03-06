src = open("./student.csv", mode = 'r')
allStudents = src.readlines()
src.close()

outputBuf = "{\n\t\"content\":[\n"

for student in allStudents:
	student.strip()
	allColumns = student.split(',')
	outputBuf += (
		"\t\t{\n" + 
		"\t\t\t\"user_id\":\"\",\n" + 
		"\t\t\t\"student_id\":\"" + allColumns[1] + "\",\n" +
		"\t\t\t\"student_name\":\"" + allColumns[0] + "\",\n" + 
		"\t\t\t\"user_access\":" + allColumns[2] + 
		"\t\t},\n")

outputBuf = outputBuf.rstrip(",\n")
outputBuf += "\n\t]\t\n}"

dest = open("import.json", mode = 'w')
dest.write(outputBuf)
dest.close()
