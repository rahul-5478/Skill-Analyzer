import mongoose from 'mongoose';

mongoose.connect(
  'mongodb+srv://Rahulji:rahul8765@cluster0.jpttrqn.mongodb.net/skill-analyzer?retryWrites=true&w=majority&appName=Cluster0'
)
.then(() => {
  console.log('✅ Connected');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});