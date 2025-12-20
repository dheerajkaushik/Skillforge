import Card from "../components/ui/Card"
import Progress from "../components/ui/Progress"
import Button from "../components/ui/Button"
import PageContainer from "../components/layout/PageContainer"

export default function StudentDashboard() {
  return (
    <PageContainer>
      <h2 className="text-2xl font-bold mb-6">My Courses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold">Java Mastery</h3>
          <p className="text-sm text-slate-500 mb-3">Learn Java from scratch</p>
          <Progress value={40} />
          <div className="mt-4">
            <Button>Continue</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold">Python Basics</h3>
          <p className="text-sm text-slate-500 mb-3">Intro to Python</p>
          <Progress value={0} />
          <div className="mt-4">
            <Button>Start</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
