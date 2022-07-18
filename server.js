const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ejs = require('ejs');
const { kStringMaxLength } = require('buffer');

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://root:root71162@cluster0.ehkayyu.mongodb.net/SchoolManagementSystem?retryWrites=true&w=majority');

const studentsSchema = {
    StudentId: String,
    FirstName: String,
    LastName: String,
    Email: String,
    Mobile: String
}

const Student = mongoose.model('Student',studentsSchema);

app.get('/', (req, res) => {
    Student.find({}, function(err, Student) {
        res.render('index', {
            StudentsList: Student
        })
    })
})

app.listen(4000, function() {
    console.log('server is running');
})