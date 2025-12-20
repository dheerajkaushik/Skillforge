export default function VerdictBox({ submission }) {
if (!submission) return null;


return (
<div className="mt-4 p-3 border rounded">
<h3>Verdict: {submission.verdict}</h3>
<p>Execution Time: {submission.executionTime} ms</p>
</div>
);
}